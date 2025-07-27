import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkProfile {
  monthlySalary: number;
  workingDays: number;
  hoursPerDay: number;
  hourlyRate: number;
}

interface ProductCost {
  price: number;
  hoursNeeded: number;
  daysNeeded: number;
}

const WorkTimeCostCalculator: React.FC = () => {
  const [workProfile, setWorkProfile] = useState<WorkProfile>({
    monthlySalary: 0,
    workingDays: 22,
    hoursPerDay: 8,
    hourlyRate: 0
  });

  const [productPrice, setProductPrice] = useState<number>(0);
  const [productCost, setProductCost] = useState<ProductCost | null>(null);
  const [isProfileSet, setIsProfileSet] = useState(false);

  // Calculate hourly rate whenever work profile changes
  useEffect(() => {
    if (workProfile.monthlySalary > 0 && workProfile.workingDays > 0 && workProfile.hoursPerDay > 0) {
      const totalHoursPerMonth = workProfile.workingDays * workProfile.hoursPerDay;
      const hourlyRate = workProfile.monthlySalary / totalHoursPerMonth;
      setWorkProfile(prev => ({ ...prev, hourlyRate }));
      setIsProfileSet(true);
    } else {
      setIsProfileSet(false);
    }
  }, [workProfile.monthlySalary, workProfile.workingDays, workProfile.hoursPerDay]);

  const handleProfileChange = (field: keyof Omit<WorkProfile, 'hourlyRate'>, value: string) => {
    const numValue = parseFloat(value) || 0;
    setWorkProfile(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const calculateProductCost = () => {
    if (productPrice > 0 && workProfile.hourlyRate > 0) {
      const hoursNeeded = productPrice / workProfile.hourlyRate;
      const daysNeeded = hoursNeeded / workProfile.hoursPerDay;
      
      setProductCost({
        price: productPrice,
        hoursNeeded,
        daysNeeded
      });
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (hours < 24) {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / workProfile.hoursPerDay);
      const remainingHours = Math.round(hours % workProfile.hoursPerDay);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Work Time Cost Calculator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover how much of your working time that purchase really costs
          </p>
        </div>

        {/* Work Profile Setup */}
        <Card className="border-primary/20">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Your Work Profile
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Set up your salary and work schedule to calculate your hourly rate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlySalary" className="text-sm font-medium">
                  Monthly Salary ($)
                </Label>
                <Input
                  id="monthlySalary"
                  type="number"
                  step="100"
                  placeholder="5000"
                  value={workProfile.monthlySalary || ''}
                  onChange={(e) => handleProfileChange('monthlySalary', e.target.value)}
                  className="border-primary/30 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workingDays" className="text-sm font-medium">
                  Working Days/Month
                </Label>
                <Input
                  id="workingDays"
                  type="number"
                  step="1"
                  placeholder="22"
                  value={workProfile.workingDays || ''}
                  onChange={(e) => handleProfileChange('workingDays', e.target.value)}
                  className="border-primary/30 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursPerDay" className="text-sm font-medium">
                  Hours/Day
                </Label>
                <Input
                  id="hoursPerDay"
                  type="number"
                  step="0.5"
                  placeholder="8"
                  value={workProfile.hoursPerDay || ''}
                  onChange={(e) => handleProfileChange('hoursPerDay', e.target.value)}
                  className="border-primary/30 focus:border-primary"
                />
              </div>
            </div>

            {isProfileSet && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-success" />
                  <h3 className="font-semibold text-success">Your Hourly Rate</h3>
                </div>
                <p className="text-2xl font-bold text-success">
                  ${workProfile.hourlyRate.toFixed(2)}/hour
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {workProfile.workingDays * workProfile.hoursPerDay} hours per month
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Cost Calculator */}
        <Card className="border-work-time/20">
          <CardHeader className="bg-work-time text-work-time-foreground">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Calculate Product Cost in Work Time
            </CardTitle>
            <CardDescription className="text-work-time-foreground/80">
              Enter a product price to see how much work time it costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {!isProfileSet && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please set up your work profile above first to calculate product costs.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="productPrice" className="text-sm font-medium">
                  Product Price ($)
                </Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  placeholder="299.99"
                  disabled={!isProfileSet}
                  value={productPrice || ''}
                  onChange={(e) => setProductPrice(parseFloat(e.target.value) || 0)}
                  className="border-work-time/30 focus:border-work-time"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={calculateProductCost}
                  disabled={!isProfileSet || productPrice <= 0}
                  className="bg-work-time hover:bg-work-time/90 text-work-time-foreground"
                >
                  Calculate
                </Button>
              </div>
            </div>

            {productCost && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-6 bg-accent/10 border border-accent/20 rounded-lg text-center">
                    <Clock className="h-8 w-8 text-accent mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-accent mb-2">Work Hours Required</h3>
                    <p className="text-3xl font-bold text-accent">
                      {formatTime(productCost.hoursNeeded)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {productCost.hoursNeeded.toFixed(1)} total hours
                    </p>
                  </div>
                  
                  <div className="p-6 bg-savings/10 border border-savings/20 rounded-lg text-center">
                    <Calendar className="h-8 w-8 text-savings mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-savings mb-2">Work Days Required</h3>
                    <p className="text-3xl font-bold text-savings">
                      {productCost.daysNeeded.toFixed(1)} days
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on {workProfile.hoursPerDay}h/day
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Reality Check:</h4>
                  <p className="text-muted-foreground">
                    To afford this ${productCost.price.toFixed(2)} purchase, you need to work{' '}
                    <span className="font-semibold text-foreground">
                      {formatTime(productCost.hoursNeeded)}
                    </span>
                    {productCost.daysNeeded >= 1 && (
                      <span>
                        {' '}or about{' '}
                        <span className="font-semibold text-foreground">
                          {productCost.daysNeeded.toFixed(1)} working day{productCost.daysNeeded >= 2 ? 's' : ''}
                        </span>
                      </span>
                    )}
                    . Is it worth it?
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Educational Note */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">💡 Smart Spending Tip</h3>
            <p className="text-muted-foreground leading-relaxed">
              This tool helps you make more conscious spending decisions by visualizing the real cost 
              of purchases in terms of your time and effort. Before making a purchase, ask yourself: 
              "Is this item worth X hours/days of my work?" This perspective can help you prioritize 
              spending on things that truly matter to you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Fix: Import Calendar icon from lucide-react
const Calendar = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default WorkTimeCostCalculator;