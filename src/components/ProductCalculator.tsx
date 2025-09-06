import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, Settings, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWorkProfile, WorkProfile } from '@/hooks/useWorkProfile';
import { Link } from 'react-router-dom';
import CoinSpillAnimation from '@/components/animations/CoinSpillAnimation';
import { useCoinSound } from '@/hooks/useCoinSound';
import { useSpendingSavings } from '@/hooks/useSpendingSavings';

interface ProductCost {
  price: number;
  hoursNeeded: number;
  daysNeeded: number;
}

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

const ProductCalculator: React.FC = () => {
  const { workProfile, hasProfile } = useWorkProfile();
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productCost, setProductCost] = useState<ProductCost | null>(null);
  const [showCoins, setShowCoins] = useState<boolean>(false);
  const [showPurchaseQuestion, setShowPurchaseQuestion] = useState<boolean>(false);

  const { playCoinSpill } = useCoinSound();
  const { totals, loading: spendingLoading, recordDecision } = useSpendingSavings();

  const calculateProductCost = () => {
    if (productPrice > 0 && workProfile?.hourlyRate) {
      const hoursNeeded = productPrice / workProfile.hourlyRate;
      const daysNeeded = hoursNeeded / workProfile.hoursPerDay;
      
      setProductCost({
        price: productPrice,
        hoursNeeded,
        daysNeeded
      });
      
      // Trigger coin animation and sound
      setShowCoins(true);
      playCoinSpill();
      
      // Hide coins after animation and show purchase question
      setTimeout(() => {
        setShowCoins(false);
        setShowPurchaseQuestion(true);
      }, 1600);
    }
  };

  const handlePurchaseResponse = (bought: boolean) => {
    setShowPurchaseQuestion(false);
    recordDecision(productPrice, bought);
  };

  const formatTime = (hours: number, workProfile: WorkProfile) => {
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
    <div className="h-screen bg-background p-3 overflow-hidden relative">
      <div className="h-full max-w-md mx-auto flex flex-col space-y-4">
        {/* Header */}
        <div className="text-center space-y-1 flex-shrink-0">
          <div className="flex items-center justify-center gap-3">
            <img 
              src="/lovable-uploads/6d15c0f9-f3ec-4b49-894a-4b5a55ff860b.png" 
              alt="Saving Assistant Logo" 
              className="h-16 w-16 object-contain rounded-lg"
              style={{ 
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
                mixBlendMode: 'multiply'
              }}
            />
            <h1 className="text-2xl font-bold text-primary">Saving Assistant</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            How much work time does it cost?
          </p>
        </div>

        {/* Work Profile Status */}
        {hasProfile && workProfile && (
          <Card className="border-primary/20 flex-shrink-0">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary text-sm">You earn ${workProfile.hourlyRate.toFixed(2)}/hour</h3>
                  <p className="text-xs text-muted-foreground">
                    ${workProfile.monthlySalary}/mo • {workProfile.workingDays}d • {workProfile.hoursPerDay}h/day
                  </p>
                </div>
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Cost Calculator */}
        <Card className="border-work-time/20 flex-1 min-h-0 flex flex-col">
          <CardHeader className="bg-work-time text-work-time-foreground p-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-4 w-4" />
              Product Cost Calculator
            </CardTitle>
            <CardDescription className="text-work-time-foreground/80 text-sm">
              Enter a price to see work time needed
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {!hasProfile && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between text-sm">
                  <span>Set up your work profile first</span>
                  <Link to="/profile">
                    <Button size="sm" className="text-xs px-2 py-1">Setup</Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="productPrice" className="text-sm font-medium">
                  Product Price ($)
                </Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  placeholder="299.99"
                  disabled={!hasProfile}
                  value={productPrice || ''}
                  onChange={(e) => setProductPrice(parseFloat(e.target.value) || 0)}
                  className="border-work-time/30 focus:border-work-time"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={calculateProductCost}
                  disabled={!hasProfile || productPrice <= 0}
                  className="bg-work-time hover:bg-work-time/90 text-work-time-foreground px-4"
                >
                  Calculate
                </Button>
              </div>
            </div>

            {productCost && workProfile && (
              <div className="space-y-3 animate-gold-glow">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg text-center transition-all duration-300 hover:bg-gold/20">
                    <Clock className="h-6 w-6 text-gold mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-gold mb-1">Work Hours</h3>
                    <p className="text-xl font-bold text-gold">
                      {formatTime(productCost.hoursNeeded, workProfile)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {productCost.hoursNeeded.toFixed(1)}h total
                    </p>
                  </div>
                  
                  <div className="p-4 bg-savings/10 border border-savings/20 rounded-lg text-center">
                    <Calendar className="h-6 w-6 text-savings mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-savings mb-1">Work Days</h3>
                    <p className="text-xl font-bold text-savings">
                      {productCost.daysNeeded.toFixed(1)} days
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {workProfile.hoursPerDay}h/day
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-1 text-sm">Reality Check:</h4>
                  <p className="text-muted-foreground text-sm">
                    ${productCost.price.toFixed(2)} costs{' '}
                    <span className="font-semibold text-foreground">
                      {formatTime(productCost.hoursNeeded, workProfile)}
                    </span>
                    {productCost.daysNeeded >= 1 && (
                      <span>
                        {' '}({productCost.daysNeeded.toFixed(1)} day{productCost.daysNeeded >= 2 ? 's' : ''})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Gold Coins Animation */}
        {showCoins && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Falling coins */}
            {[...Array(6)].map((_, i) => (
              <div
                key={`fall-${i}`}
                className="absolute w-6 h-6 bg-gold rounded-full animate-coin-fall"
                style={{
                  left: `${20 + i * 12}%`,
                  animationDelay: `${i * 0.1}s`,
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                }}
              >
                <div className="w-full h-full bg-gold/80 rounded-full flex items-center justify-center text-gold-foreground text-xs font-bold">
                  $
                </div>
              </div>
            ))}
            
            {/* Rising coins */}
            {[...Array(5)].map((_, i) => (
              <div
                key={`rise-${i}`}
                className="absolute w-5 h-5 bg-gold rounded-full animate-coin-rise"
                style={{
                  left: `${30 + i * 15}%`,
                  animationDelay: `${0.2 + i * 0.15}s`,
                  boxShadow: '0 0 8px rgba(255, 215, 0, 0.4)'
                }}
              >
                <div className="w-full h-full bg-gold/80 rounded-full flex items-center justify-center text-gold-foreground text-xs font-bold">
                  $
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optional Purchase Question */}
        {showPurchaseQuestion && productCost && workProfile && (
          <Card className="border-primary/20 flex-shrink-0 animate-in slide-in-from-bottom-3 duration-300">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Did you buy it?</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    After seeing this ${productPrice} item costs {formatTime(productCost.hoursNeeded, workProfile)} of work time
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handlePurchaseResponse(false)}
                      className="text-xs px-3"
                    >
                      No
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handlePurchaseResponse(true)}
                      className="text-xs px-3"
                    >
                      Yes
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPurchaseQuestion(false)}
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spending & Savings Totals - Only show when no calculation results */}
        {!productCost && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Financial Journey</CardTitle>
            </CardHeader>
            <CardContent>
              {spendingLoading ? (
                <div className="text-center text-muted-foreground">Loading your totals...</div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${totals.totalSpent.toFixed(2)}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                      Total Spent
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${totals.totalSaved.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Total Saved
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductCalculator;