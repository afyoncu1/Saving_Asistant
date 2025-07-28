import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Calculator, ArrowLeft, Save } from 'lucide-react';
import { useWorkProfile } from '@/hooks/useWorkProfile';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface WorkProfileForm {
  monthlySalary: number;
  workingDays: number;
  hoursPerDay: number;
}

const WorkProfile: React.FC = () => {
  const { workProfile, saveWorkProfile } = useWorkProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<WorkProfileForm>({
    monthlySalary: 0,
    workingDays: 22,
    hoursPerDay: 8
  });

  const [calculatedHourlyRate, setCalculatedHourlyRate] = useState<number>(0);

  // Load existing profile data
  useEffect(() => {
    if (workProfile) {
      setFormData({
        monthlySalary: workProfile.monthlySalary,
        workingDays: workProfile.workingDays,
        hoursPerDay: workProfile.hoursPerDay
      });
    }
  }, [workProfile]);

  // Calculate hourly rate whenever form data changes
  useEffect(() => {
    if (formData.monthlySalary > 0 && formData.workingDays > 0 && formData.hoursPerDay > 0) {
      const totalHoursPerMonth = formData.workingDays * formData.hoursPerDay;
      const hourlyRate = formData.monthlySalary / totalHoursPerMonth;
      setCalculatedHourlyRate(hourlyRate);
    } else {
      setCalculatedHourlyRate(0);
    }
  }, [formData]);

  const handleInputChange = (field: keyof WorkProfileForm, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = () => {
    if (formData.monthlySalary > 0 && formData.workingDays > 0 && formData.hoursPerDay > 0) {
      saveWorkProfile(formData);
      toast({
        title: "Profile Saved",
        description: "Your work profile has been saved successfully.",
      });
      navigate('/');
    } else {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields with valid values.",
        variant: "destructive",
      });
    }
  };

  const isFormValid = formData.monthlySalary > 0 && formData.workingDays > 0 && formData.hoursPerDay > 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calculator
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">Work Profile Setup</h1>
            <p className="text-muted-foreground">Configure your salary and work schedule</p>
          </div>
        </div>

        {/* Work Profile Form */}
        <Card className="border-primary/20">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Your Work Information
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Enter your salary and work schedule to calculate your hourly rate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlySalary" className="text-sm font-medium">
                  Monthly Salary ($)
                </Label>
                <Input
                  id="monthlySalary"
                  type="number"
                  step="100"
                  placeholder="5000"
                  value={formData.monthlySalary || ''}
                  onChange={(e) => handleInputChange('monthlySalary', e.target.value)}
                  className="border-primary/30 focus:border-primary"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workingDays" className="text-sm font-medium">
                    Working Days per Month
                  </Label>
                  <Input
                    id="workingDays"
                    type="number"
                    step="1"
                    placeholder="22"
                    value={formData.workingDays || ''}
                    onChange={(e) => handleInputChange('workingDays', e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hoursPerDay" className="text-sm font-medium">
                    Hours per Day
                  </Label>
                  <Input
                    id="hoursPerDay"
                    type="number"
                    step="0.5"
                    placeholder="8"
                    value={formData.hoursPerDay || ''}
                    onChange={(e) => handleInputChange('hoursPerDay', e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {calculatedHourlyRate > 0 && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-success" />
                  <h3 className="font-semibold text-success">Calculated Hourly Rate</h3>
                </div>
                <p className="text-2xl font-bold text-success">
                  ${calculatedHourlyRate.toFixed(2)}/hour
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {formData.workingDays * formData.hoursPerDay} hours per month
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleSave}
                disabled={!isFormValid}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
              <Link to="/">
                <Button variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">ℹ️ About Your Work Profile</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your work profile information is saved locally in your browser and is used to calculate 
              how much working time any purchase costs. This helps you make more informed spending 
              decisions by understanding the real value of your time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkProfile;