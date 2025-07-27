import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp } from 'lucide-react';

interface BlackScholesInputs {
  stockPrice: number;
  strikePrice: number;
  timeToExpiration: number;
  riskFreeRate: number;
  volatility: number;
  optionType: 'call' | 'put';
}

interface CalculationResult {
  optionPrice: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

const BlackScholesCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<BlackScholesInputs>({
    stockPrice: 100,
    strikePrice: 100,
    timeToExpiration: 0.25,
    riskFreeRate: 0.05,
    volatility: 0.2,
    optionType: 'call'
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Standard normal cumulative distribution function
  const normalCDF = (x: number): number => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  };

  // Standard normal probability density function
  const normalPDF = (x: number): number => {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  };

  const calculateBlackScholes = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      const { stockPrice, strikePrice, timeToExpiration, riskFreeRate, volatility, optionType } = inputs;

      const d1 = (Math.log(stockPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiration) 
                 / (volatility * Math.sqrt(timeToExpiration));
      const d2 = d1 - volatility * Math.sqrt(timeToExpiration);

      let optionPrice: number;
      let delta: number;

      if (optionType === 'call') {
        optionPrice = stockPrice * normalCDF(d1) - strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2);
        delta = normalCDF(d1);
      } else {
        optionPrice = strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2) - stockPrice * normalCDF(-d1);
        delta = normalCDF(d1) - 1;
      }

      // Calculate Greeks
      const gamma = normalPDF(d1) / (stockPrice * volatility * Math.sqrt(timeToExpiration));
      const theta = optionType === 'call' 
        ? (-stockPrice * normalPDF(d1) * volatility / (2 * Math.sqrt(timeToExpiration)) 
           - riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2)) / 365
        : (-stockPrice * normalPDF(d1) * volatility / (2 * Math.sqrt(timeToExpiration)) 
           + riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2)) / 365;
      const vega = stockPrice * normalPDF(d1) * Math.sqrt(timeToExpiration) / 100;
      const rho = optionType === 'call' 
        ? strikePrice * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2) / 100
        : -strikePrice * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2) / 100;

      setResult({
        optionPrice,
        delta,
        gamma,
        theta,
        vega,
        rho
      });
      setIsCalculating(false);
    }, 500);
  };

  const handleInputChange = (field: keyof BlackScholesInputs, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-financial" />
            <h1 className="text-4xl font-bold text-financial">Black-Scholes Calculator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Calculate European option prices and Greeks using the Black-Scholes model
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="border-financial/20">
            <CardHeader className="bg-financial text-financial-foreground">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Option Parameters
              </CardTitle>
              <CardDescription className="text-financial-foreground/80">
                Enter the required parameters for Black-Scholes calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockPrice" className="text-sm font-medium">
                    Current Stock Price ($)
                  </Label>
                  <Input
                    id="stockPrice"
                    type="number"
                    step="0.01"
                    value={inputs.stockPrice}
                    onChange={(e) => handleInputChange('stockPrice', e.target.value)}
                    className="border-financial/30 focus:border-financial"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strikePrice" className="text-sm font-medium">
                    Strike Price ($)
                  </Label>
                  <Input
                    id="strikePrice"
                    type="number"
                    step="0.01"
                    value={inputs.strikePrice}
                    onChange={(e) => handleInputChange('strikePrice', e.target.value)}
                    className="border-financial/30 focus:border-financial"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeToExpiration" className="text-sm font-medium">
                    Time to Expiration (Years)
                  </Label>
                  <Input
                    id="timeToExpiration"
                    type="number"
                    step="0.01"
                    value={inputs.timeToExpiration}
                    onChange={(e) => handleInputChange('timeToExpiration', e.target.value)}
                    className="border-financial/30 focus:border-financial"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskFreeRate" className="text-sm font-medium">
                    Risk-Free Rate (%)
                  </Label>
                  <Input
                    id="riskFreeRate"
                    type="number"
                    step="0.001"
                    value={inputs.riskFreeRate * 100}
                    onChange={(e) => handleInputChange('riskFreeRate', parseFloat(e.target.value) / 100)}
                    className="border-financial/30 focus:border-financial"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volatility" className="text-sm font-medium">
                    Volatility (%)
                  </Label>
                  <Input
                    id="volatility"
                    type="number"
                    step="0.01"
                    value={inputs.volatility * 100}
                    onChange={(e) => handleInputChange('volatility', parseFloat(e.target.value) / 100)}
                    className="border-financial/30 focus:border-financial"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="optionType" className="text-sm font-medium">
                    Option Type
                  </Label>
                  <Select value={inputs.optionType} onValueChange={(value) => handleInputChange('optionType', value)}>
                    <SelectTrigger className="border-financial/30 focus:border-financial">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call Option</SelectItem>
                      <SelectItem value="put">Put Option</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={calculateBlackScholes}
                disabled={isCalculating}
                className="w-full bg-financial hover:bg-financial/90 text-financial-foreground"
                size="lg"
              >
                {isCalculating ? 'Calculating...' : 'Calculate Option Price'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="border-financial/20">
            <CardHeader className="bg-financial-accent text-financial">
              <CardTitle>Calculation Results</CardTitle>
              <CardDescription className="text-financial/80">
                Option price and risk sensitivities (Greeks)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {result ? (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-financial-muted rounded-lg">
                    <h3 className="text-lg font-semibold text-financial mb-2">Option Price</h3>
                    <p className="text-3xl font-bold text-financial">
                      ${result.optionPrice.toFixed(4)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg border-financial/20">
                      <h4 className="font-semibold text-financial mb-1">Delta (Δ)</h4>
                      <p className="text-2xl font-bold">{result.delta.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">Price sensitivity to stock price</p>
                    </div>
                    <div className="p-4 border rounded-lg border-financial/20">
                      <h4 className="font-semibold text-financial mb-1">Gamma (Γ)</h4>
                      <p className="text-2xl font-bold">{result.gamma.toFixed(6)}</p>
                      <p className="text-xs text-muted-foreground">Rate of change of delta</p>
                    </div>
                    <div className="p-4 border rounded-lg border-financial/20">
                      <h4 className="font-semibold text-financial mb-1">Theta (Θ)</h4>
                      <p className="text-2xl font-bold">{result.theta.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">Time decay per day</p>
                    </div>
                    <div className="p-4 border rounded-lg border-financial/20">
                      <h4 className="font-semibold text-financial mb-1">Vega (ν)</h4>
                      <p className="text-2xl font-bold">{result.vega.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">Sensitivity to volatility</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-financial/20">
                    <h4 className="font-semibold text-financial mb-1">Rho (ρ)</h4>
                    <p className="text-2xl font-bold">{result.rho.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground">Sensitivity to interest rate changes</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter parameters and click "Calculate" to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Educational Note */}
        <Card className="border-financial/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-financial mb-3">About the Black-Scholes Model</h3>
            <p className="text-muted-foreground leading-relaxed">
              The Black-Scholes model is a mathematical framework for pricing European-style options. 
              It assumes constant volatility, constant risk-free interest rate, and no dividends. 
              The model provides theoretical estimates and the Greeks help understand how option prices 
              change with respect to various factors.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlackScholesCalculator;