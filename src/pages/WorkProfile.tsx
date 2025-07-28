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
    <div className="h-screen bg-background p-3 overflow-hidden">
      <div className="h-full max-w-md mx-auto flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to="/">
            <Button variant="outline" size="sm" className="px-2 py-1 text-xs">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">Work Profile</h1>
            <p className="text-muted-foreground text-sm">Setup your salary info</p>
          </div>
        </div>

        {/* Work Profile Form */}
        <Card className="border-primary/20 flex-1 min-h-0 flex flex-col bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Your Work Information
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-sm">
              Enter your details to calculate hourly rate
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
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
                  className="border-primary/30 focus:border-primary bg-background/80"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="workingDays" className="text-sm font-medium">
                    Days/Month
                  </Label>
                  <Input
                    id="workingDays"
                    type="number"
                    step="1"
                    placeholder="22"
                    value={formData.workingDays || ''}
                    onChange={(e) => handleInputChange('workingDays', e.target.value)}
                    className="border-primary/30 focus:border-primary bg-background/80"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hoursPerDay" className="text-sm font-medium">
                    Hours/Day
                  </Label>
                  <Input
                    id="hoursPerDay"
                    type="number"
                    step="0.5"
                    placeholder="8"
                    value={formData.hoursPerDay || ''}
                    onChange={(e) => handleInputChange('hoursPerDay', e.target.value)}
                    className="border-primary/30 focus:border-primary bg-background/80"
                  />
                </div>
              </div>
            </div>

            {calculatedHourlyRate > 0 && (
              <div className="p-4 bg-gradient-to-r from-success/20 to-success/10 border border-success/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-success" />
                  <h3 className="font-semibold text-success text-sm">Calculated Rate</h3>
                </div>
                <p className="text-xl font-bold text-success">
                  ${calculatedHourlyRate.toFixed(2)}/hour
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.workingDays * formData.hoursPerDay} hours/month
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSave}
                disabled={!isFormValid}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
              <Link to="/">
                <Button variant="outline" className="px-4">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkProfile;