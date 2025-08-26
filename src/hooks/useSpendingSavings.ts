import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SpendingSavings {
  totalSpent: number;
  totalSaved: number;
}

export const useSpendingSavings = () => {
  const [totals, setTotals] = useState<SpendingSavings>({ totalSpent: 0, totalSaved: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTotals = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        setTotals({ totalSpent: 0, totalSaved: 0 });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('purchase_decisions')
        .select('product_price, decision');

      if (error) throw error;

      const spent = data
        ?.filter(item => item.decision === 'bought')
        .reduce((sum, item) => sum + Number(item.product_price), 0) || 0;

      const saved = data
        ?.filter(item => item.decision === 'saved')
        .reduce((sum, item) => sum + Number(item.product_price), 0) || 0;

      setTotals({ totalSpent: spent, totalSaved: saved });
    } catch (error) {
      console.error('Error fetching spending/savings:', error);
      toast({
        title: "Error",
        description: "Failed to load spending/savings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

      const { error } = await supabase
        .from('purchase_decisions')
        .insert({
          user_id: session.session.user.id,
          product_price: productPrice,
          decision: bought ? 'bought' : 'saved'
        });

      if (error) throw error;

      // Update totals immediately
      if (bought) {
        setTotals(prev => ({ ...prev, totalSpent: prev.totalSpent + productPrice }));
      } else {
        setTotals(prev => ({ ...prev, totalSaved: prev.totalSaved + productPrice }));
      }

      toast({
        title: "Decision recorded",
        description: `Added $${productPrice} to your ${bought ? 'spending' : 'savings'} total`,
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
    totals,
    loading,
    recordDecision,
    refetch: fetchTotals
  };
};