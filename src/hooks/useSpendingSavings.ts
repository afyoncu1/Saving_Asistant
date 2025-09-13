import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SpendingSavings {
  totalSpent: number;
  totalSaved: number;
}

interface MonthlyData {
  year: number;
  month: number;
  total_spent: number;
  total_saved: number;
}

const getMonthName = (month: number) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

export const useSpendingSavings = () => {
  const [totals, setTotals] = useState<SpendingSavings>({ totalSpent: 0, totalSaved: 0 });
  const [currentMonthTotals, setCurrentMonthTotals] = useState<SpendingSavings>({ totalSpent: 0, totalSaved: 0 });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getCurrentMonth = () => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  };

  const fetchCurrentMonthTotals = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        setCurrentMonthTotals({ totalSpent: 0, totalSaved: 0 });
        return;
      }

      const { year, month } = getCurrentMonth();
      
      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCurrentMonthTotals({
          totalSpent: Number(data.total_spent),
          totalSaved: Number(data.total_saved)
        });
      } else {
        setCurrentMonthTotals({ totalSpent: 0, totalSaved: 0 });
      }
    } catch (error) {
      console.error('Error fetching current month totals:', error);
    }
  };

  const fetchAllMonthlyData = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        setMonthlyData([]);
        setTotals({ totalSpent: 0, totalSaved: 0 });
        return;
      }

      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;

      setMonthlyData(data || []);
      
      // Calculate all-time totals
      const allTimeTotals = (data || []).reduce(
        (acc, curr) => ({
          totalSpent: acc.totalSpent + Number(curr.total_spent),
          totalSaved: acc.totalSaved + Number(curr.total_saved)
        }),
        { totalSpent: 0, totalSaved: 0 }
      );
      
      setTotals(allTimeTotals);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const fetchTotals = async () => {
    setLoading(true);
    await Promise.all([fetchCurrentMonthTotals(), fetchAllMonthlyData()]);
    setLoading(false);
  };

  const recordDecision = async (productPrice: number, bought: boolean) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to track your spending decisions",
          variant: "destructive",
        });
        return;
      }

      const { year, month } = getCurrentMonth();

      const { error } = await supabase
        .from('purchase_decisions')
        .insert({
          user_id: session.session.user.id,
          product_price: productPrice,
          decision: bought ? 'bought' : 'saved',
          month,
          year
        });

      if (error) throw error;

      // Refresh data after recording
      await fetchTotals();

      toast({
        title: "Decision recorded",
        description: `Added $${productPrice} to your ${bought ? 'spending' : 'savings'} total for ${getMonthName(month)}`,
      });
    } catch (error) {
      console.error('Error recording decision:', error);
      toast({
        title: "Error",
        description: "Failed to record your decision",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTotals();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchTotals();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    totals, // All-time totals
    currentMonthTotals, // Current month totals
    monthlyData, // All monthly data with month names
    loading,
    recordDecision,
    refetch: fetchTotals,
    getCurrentMonth,
    getMonthName
  };
};