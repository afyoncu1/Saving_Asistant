import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, Settings, X, ArrowLeft, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWorkProfile, WorkProfile } from '@/hooks/useWorkProfile';
import { Link } from 'react-router-dom';
import CoinSpillAnimation from '@/components/animations/CoinSpillAnimation';
import { useCoinSound } from '@/hooks/useCoinSound';
import { useSpendingSavings } from '@/hooks/useSpendingSavings';
import { useAuth } from '@/hooks/useAuth';

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
  const [showFinancialJourney, setShowFinancialJourney] = useState<boolean>(false);
  const [showAllMonths, setShowAllMonths] = useState<boolean>(false);

  const { playCoinSpill } = useCoinSound();
  const { currentMonthTotals, totals, monthlyData, loading: spendingLoading, recordDecision, getMonthName, getCurrentMonth } = useSpendingSavings();
  const { user, signOut } = useAuth();

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
      
      // Hide coins after animation completes
      setTimeout(() => {
        setShowCoins(false);
      }, 2000);
      
      // Show purchase question later
      setTimeout(() => {
        setShowPurchaseQuestion(true);
      }, 5000);
    }
  };

  const handlePurchaseResponse = (bought: boolean) => {
    setShowPurchaseQuestion(false);
    recordDecision(productPrice, bought);
  };

  const resetCalculation = () => {
    setProductCost(null);
    setShowPurchaseQuestion(false);
    setShowFinancialJourney(false);
    setShowAllMonths(false);
    setProductPrice(0);
  };

  const viewFinancialJourney = () => {
    setShowFinancialJourney(true);
  };

  const formatTime = (hours: number, workProfile: WorkProfile) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (hours < 24) {
      let wholeHours = Math.floor(hours);
      let minutes = Math.round((hours - wholeHours) * 60);
      
      // Handle case where minutes rounds to 60
      if (minutes >= 60) {
        wholeHours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
      
      return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / workProfile.hoursPerDay);
      const remainingHours = Math.round(hours % workProfile.hoursPerDay);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 relative ${showFinancialJourney ? 'overflow-y-auto' : 'h-screen overflow-hidden'}`}>
      <div className={`max-w-sm mx-auto flex flex-col space-y-6 ${showFinancialJourney ? 'min-h-full' : 'h-full'}`}>
        {/* Header */}
        <div className="text-center space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-3 flex-1">
              <img 
                src="/lovable-uploads/6d15c0f9-f3ec-4b49-894a-4b5a55ff860b.png" 
                alt="Saving Assistant Logo" 
                className="h-12 w-12 object-contain rounded-xl"
                style={{ 
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
                  mixBlendMode: 'multiply'
                }}
              />
              <h1 className="text-xl font-bold text-primary">Saving Assistant</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              Sign Out
            </Button>
          </div>
          <div className="bg-card rounded-2xl p-4 border shadow-sm">
            <p className="text-foreground font-medium">
              Welcome back, {user?.email?.split('@')[0]}!
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Let's see what your time is worth
            </p>
          </div>
        </div>

        {/* Work Profile Status */}
        {hasProfile && workProfile && (
          <div className="bg-card rounded-2xl p-4 border shadow-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-primary text-lg">${workProfile.hourlyRate.toFixed(2)}</h3>
                <p className="text-sm text-muted-foreground">
                  per hour • {workProfile.workingDays} days • {workProfile.hoursPerDay}h/day
                </p>
              </div>
              <Link to="/profile">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Settings className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Product Cost Calculator */}
        <div className="bg-card rounded-2xl border shadow-sm flex-1 min-h-0 flex flex-col">
          <div className="p-6 flex-shrink-0">
            <h2 className="text-2xl font-bold text-center mb-2">WORTH IT?</h2>
            <p className="text-center text-muted-foreground text-sm mb-6">
              Enter a price to see how much work time it costs
            </p>
            
            {!hasProfile && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between text-sm">
                  <span>Set up your work profile first</span>
                  <Link to="/profile">
                    <Button size="sm" className="text-xs px-3 py-1 rounded-full">Setup</Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productPrice" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Purchase Price
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="productPrice"
                    type="number"
                    step="0.01"
                    placeholder="299.99"
                    disabled={!hasProfile}
                    value={productPrice || ''}
                    onChange={(e) => setProductPrice(parseFloat(e.target.value) || 0)}
                    className="pl-8 h-12 text-lg font-medium rounded-xl border-2 focus:border-primary"
                  />
                </div>
              </div>
              <Button 
                onClick={calculateProductCost}
                disabled={!hasProfile || productPrice <= 0}
                className="w-full h-12 rounded-xl font-semibold text-base"
                size="lg"
              >
                Calculate Work Time
              </Button>
            </div>
          </div>

          {productCost && workProfile && (
            <div className="px-6 pb-6 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Clock className="h-4 w-4" />
                  Time at Work
                </div>
                <div className="text-3xl font-bold text-primary mb-6">
                  {formatTime(productCost.hoursNeeded, workProfile)}
                </div>
                
                <div className="bg-muted/50 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reality Check
                  </div>
                  <div className="text-lg font-semibold">
                    ${productCost.price.toFixed(2)} = {formatTime(productCost.hoursNeeded, workProfile)}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={resetCalculation}
                    className="flex-1 h-12 rounded-xl font-semibold border-2"
                  >
                    Don't Buy
                  </Button>
                  <Button
                    onClick={viewFinancialJourney}
                    className="flex-1 h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90"
                  >
                    Buy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
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
            <CardContent className="p-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Did you buy it?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    ${productPrice} = {formatTime(productCost.hoursNeeded, workProfile)}
                  </p>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handlePurchaseResponse(false)}
                      className="text-xs px-2 py-1 h-6"
                    >
                      No
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handlePurchaseResponse(true)}
                      className="text-xs px-2 py-1 h-6"
                    >
                      Yes
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPurchaseQuestion(false)}
                  className="h-4 w-4 p-0 hover:bg-muted"
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spending & Savings Totals - Compact Card Design */}
        {(!productCost || showFinancialJourney) && (
          <Card className="mt-3 border-primary/10">
            {showFinancialJourney && (
              <div className="flex justify-end p-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFinancialJourney(false)}
                  className="text-xs px-2 h-6"
                >
                  <X className="h-3 w-3 mr-1" />
                  Close
                </Button>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {showAllMonths ? 'All Time Journey' : `${getMonthName(getCurrentMonth().month)} ${getCurrentMonth().year}`}
              </CardTitle>
              {!showAllMonths && (
                <CardDescription className="text-xs">Your financial decisions this month</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0 pb-3 space-y-3">
              {spendingLoading ? (
                <div className="text-center text-muted-foreground text-xs py-2">Loading your totals...</div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        ${showAllMonths ? totals.totalSpent.toFixed(0) : currentMonthTotals.totalSpent.toFixed(0)}
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300 font-medium">
                        Total Spent
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${showAllMonths ? totals.totalSaved.toFixed(0) : currentMonthTotals.totalSaved.toFixed(0)}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300 font-medium">
                        Total Saved
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllMonths(!showAllMonths)}
                      className="text-xs h-6 px-3"
                    >
                      {showAllMonths ? 'Show This Month' : 'View All Months'}
                    </Button>
                  </div>

                  {showAllMonths && monthlyData.length > 0 && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      <h4 className="font-semibold text-xs mb-1">Monthly Breakdown:</h4>
                      {monthlyData.map((month) => (
                        <div key={`${month.month}-${month.year}`} className="flex justify-between items-center text-xs p-1 rounded bg-muted/30">
                          <span className="font-medium">
                            {getMonthName(month.month)} {month.year}
                          </span>
                          <div className="flex gap-2">
                            <span className="text-red-600 dark:text-red-400">
                              -${month.total_spent.toFixed(0)}
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              +${month.total_saved.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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