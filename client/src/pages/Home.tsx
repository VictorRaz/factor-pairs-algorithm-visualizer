import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Play, RotateCcw } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface AlgorithmStep {
  i: number;
  j: number;
  isMatch: boolean;
  operation: string;
}

interface AlgorithmResult {
  steps: AlgorithmStep[];
  pairs: [number, number][];
  operations: number;
  time: number;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [n, setN] = useState<number>(36);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationStartTime, setAnimationStartTime] = useState<number>(0);
  const [simulatedTime, setSimulatedTime] = useState<number>(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<"brute" | "linear" | "sqrt">("sqrt");
  const [results, setResults] = useState<Record<string, AlgorithmResult>>({});

  // Algorithm implementations with step tracking
  const runBruteForce = (num: number): AlgorithmResult => {
    const start = performance.now();
    const steps: AlgorithmStep[] = [];
    const pairs: [number, number][] = [];
    
    for (let i = 1; i <= num; i++) {
      for (let j = 1; j <= num; j++) {
        const isMatch = i * j === num;
        steps.push({ 
          i, 
          j, 
          isMatch, 
          operation: `Testing ${i} × ${j} = ${i * j}` 
        });
        if (isMatch) {
          pairs.push([i, j]);
        }
      }
    }
    
    const time = performance.now() - start;
    return { steps, pairs, operations: steps.length, time };
  };

  const runLinear = (num: number): AlgorithmResult => {
    const start = performance.now();
    const steps: AlgorithmStep[] = [];
    const pairs: [number, number][] = [];
    
    for (let i = 1; i <= num; i++) {
      const isMatch = num % i === 0;
      const j = isMatch ? num / i : 0;
      steps.push({ 
        i, 
        j, 
        isMatch, 
        operation: isMatch ? `${i} divides ${num}, partner is ${j}` : `${i} does not divide ${num}` 
      });
      if (isMatch) {
        pairs.push([i, j]);
      }
    }
    
    const time = performance.now() - start;
    return { steps, pairs, operations: steps.length, time };
  };

  const runSqrt = (num: number): AlgorithmResult => {
    const start = performance.now();
    const steps: AlgorithmStep[] = [];
    const pairsList: [number, number][] = [];
    
    const sqrtN = Math.sqrt(num);
    for (let i = 1; i <= sqrtN; i++) {
      const isMatch = num % i === 0;
      const j = isMatch ? num / i : 0;
      steps.push({ 
        i, 
        j, 
        isMatch, 
        operation: isMatch 
          ? `${i} divides ${num}, found pair (${i}, ${j})${i !== j ? ` and (${j}, ${i})` : ''}` 
          : `${i} does not divide ${num}` 
      });
      if (isMatch) {
        pairsList.push([i, j]);
        if (i !== j) {
          pairsList.push([j, i]);
        }
      }
    }
    
    pairsList.sort((a, b) => a[0] - b[0]);
    const time = performance.now() - start;
    return { steps, pairs: pairsList, operations: steps.length, time };
  };

  // Run all algorithms when n changes
  useEffect(() => {
    const bruteResult = runBruteForce(n);
    const linearResult = runLinear(n);
    const sqrtResult = runSqrt(n);
    
    setResults({
      brute: bruteResult,
      linear: linearResult,
      sqrt: sqrtResult,
    });
    setCurrentStep(0);
  }, [n]);

  // Animation for step-by-step visualization
  useEffect(() => {
    if (isRunning && results[selectedAlgorithm]) {
      const maxSteps = results[selectedAlgorithm].steps.length;
      if (currentStep < maxSteps) {
        const timer = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 100); // Faster animation
        return () => clearTimeout(timer);
      } else {
        setIsRunning(false);
      }
    }
  }, [isRunning, currentStep, selectedAlgorithm, results]);

  // Update simulated time based on animation progress
  useEffect(() => {
    if (isRunning && results[selectedAlgorithm] && animationStartTime > 0) {
      const interval = setInterval(() => {
        const elapsed = performance.now() - animationStartTime;
        const progress = currentStep / results[selectedAlgorithm].steps.length;
        
        // Scale factor based on algorithm complexity (exaggerated for illustration)
        const scaleFactor = {
          brute: 1000,    // Slowest
          linear: 100,    // Medium
          sqrt: 10        // Fastest
        }[selectedAlgorithm] || 1;
        
        // Simulated time = progress * total_operations * scale_factor / 1000
        const simTime = progress * results[selectedAlgorithm].operations * scaleFactor / 1000;
        setSimulatedTime(simTime);
      }, 50);
      
      return () => clearInterval(interval);
    } else if (!isRunning) {
      // Show final time when animation completes
      if (results[selectedAlgorithm]) {
        const scaleFactor = {
          brute: 1000,
          linear: 100,
          sqrt: 10
        }[selectedAlgorithm] || 1;
        setSimulatedTime(results[selectedAlgorithm].operations * scaleFactor / 1000);
      }
    }
  }, [isRunning, currentStep, selectedAlgorithm, results, animationStartTime]);

  const handleRun = () => {
    setCurrentStep(0);
    setAnimationStartTime(performance.now());
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setAnimationStartTime(0);
    setSimulatedTime(0);
  };

  const visibleSteps = useMemo(() => {
    if (!results[selectedAlgorithm]) return [];
    return results[selectedAlgorithm].steps.slice(0, currentStep);
  }, [results, selectedAlgorithm, currentStep]);

  const currentPairs = useMemo(() => {
    if (!results[selectedAlgorithm]) return [];
    const pairs: [number, number][] = [];
    for (const step of visibleSteps) {
      if (step.isMatch) {
        pairs.push([step.i, step.j]);
      }
    }
    return pairs;
  }, [visibleSteps, results, selectedAlgorithm]);

  const getComplexityColor = (algo: string) => {
    switch (algo) {
      case "brute": return "text-red-500";
      case "linear": return "text-orange-500";
      case "sqrt": return "text-green-500";
      default: return "";
    }
  };

  const getComplexityBadge = (algo: string) => {
    switch (algo) {
      case "brute": return "O(n²)";
      case "linear": return "O(n)";
      case "sqrt": return "O(√n)";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Factor Pairs Algorithm Visualizer</h1>
            <p className="text-sm text-muted-foreground">From Brute Force to Brilliance</p>
          </div>
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>The Problem</CardTitle>
              <CardDescription>
                Find all pairs of numbers that multiply to give <code className="px-2 py-1 bg-muted rounded">n</code> using numbers from 1 to <code className="px-2 py-1 bg-muted rounded">n</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This simple problem reveals the vast difference between functional code and optimized code. 
                Explore three different approaches and see how mathematical insight can improve performance by orders of magnitude.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Controls */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Visualization</CardTitle>
              <CardDescription>Adjust the value of n and watch the algorithms in action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* N Value Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Value of n: <span className="text-2xl font-bold text-primary">{n}</span></label>
                  <div className="text-sm text-muted-foreground">√n = {Math.sqrt(n).toFixed(2)}</div>
                </div>
                <Slider
                  value={[n]}
                  onValueChange={(value) => setN(value[0])}
                  min={4}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>4</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Algorithm Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Algorithm</label>
                <Tabs value={selectedAlgorithm} onValueChange={(v) => setSelectedAlgorithm(v as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="brute" disabled={isRunning}>
                      <span className="flex items-center gap-2">
                        Brute Force
                        <Badge variant="destructive" className="text-xs">O(n²)</Badge>
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="linear" disabled={isRunning}>
                      <span className="flex items-center gap-2">
                        Single Loop
                        <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-500">O(n)</Badge>
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="sqrt" disabled={isRunning}>
                      <span className="flex items-center gap-2">
                        Optimized
                        <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-500">O(√n)</Badge>
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleRun} disabled={isRunning} className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  Run Animation
                </Button>
                <Button onClick={handleReset} variant="outline" disabled={isRunning}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Progress Bar */}
              {results[selectedAlgorithm] && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      Step {currentStep} / {results[selectedAlgorithm].steps.length}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-100 ${
                        selectedAlgorithm === "brute" ? "bg-red-500" : 
                        selectedAlgorithm === "linear" ? "bg-orange-500" : 
                        "bg-green-500"
                      }`}
                      style={{ 
                        width: `${(currentStep / results[selectedAlgorithm].steps.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Algorithm Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Steps</CardTitle>
              <CardDescription>
                Watch how the {selectedAlgorithm === "brute" ? "Brute Force" : selectedAlgorithm === "linear" ? "Single Loop" : "Optimized"} algorithm works
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto">
                {visibleSteps.length > 0 ? (
                  visibleSteps.slice(-10).map((step, idx) => (
                    <div 
                      key={visibleSteps.length - 10 + idx} 
                      className={`py-1 ${step.isMatch ? 'text-green-400 font-bold' : 'text-muted-foreground'}`}
                    >
                      {step.operation}
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">Press Run to see steps...</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Factor Pairs Found */}
          <Card>
            <CardHeader>
              <CardTitle>Factor Pairs Found</CardTitle>
              <CardDescription>
                {currentPairs.length} pair{currentPairs.length !== 1 ? 's' : ''} found so far
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                {currentPairs.length > 0 ? (
                  currentPairs.map((pair, idx) => (
                    <div key={idx} className="py-1 animate-in fade-in slide-in-from-left-2">
                      <span className="text-primary">{pair[0]}</span> × <span className="text-primary">{pair[1]}</span> = <span className="text-muted-foreground">{n}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No pairs found yet...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Real-time comparison of all three algorithms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(results).map(([algo, result]) => (
                  <div key={algo} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{algo === "sqrt" ? "Optimized" : algo === "linear" ? "Single Loop" : "Brute Force"}</span>
                      <Badge className={getComplexityColor(algo)}>{getComplexityBadge(algo)}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Operations</div>
                        <div className="text-lg font-bold">{result.operations.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Simulated Time</div>
                        <div className="text-lg font-bold">
                          {selectedAlgorithm === algo && (isRunning || currentStep > 0)
                            ? `${simulatedTime.toFixed(1)}ms`
                            : '0.0ms'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Pairs Found</div>
                        <div className="text-lg font-bold">{result.pairs.length}</div>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${algo === "brute" ? "bg-red-500" : algo === "linear" ? "bg-orange-500" : "bg-green-500"}`}
                        style={{ width: `${(result.operations / results.brute?.operations) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Visual Diagrams */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Comparison</CardTitle>
              <CardDescription>Visual representation of how each algorithm performs</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="complexity">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="complexity">Complexity</TabsTrigger>
                  <TabsTrigger value="operations">Operations</TabsTrigger>
                  <TabsTrigger value="speedup">Speedup</TabsTrigger>
                  <TabsTrigger value="symmetry">Symmetry</TabsTrigger>
                </TabsList>
                <TabsContent value="complexity" className="mt-4">
                  <img src="/complexity_comparison.png" alt="Complexity Comparison" className="w-full rounded-lg" />
                </TabsContent>
                <TabsContent value="operations" className="mt-4">
                  <img src="/operations_comparison.png" alt="Operations Comparison" className="w-full rounded-lg" />
                </TabsContent>
                <TabsContent value="speedup" className="mt-4">
                  <img src="/speedup_comparison.png" alt="Speedup Comparison" className="w-full rounded-lg" />
                </TabsContent>
                <TabsContent value="symmetry" className="mt-4">
                  <img src="/factor_pairs_visual.png" alt="Factor Pairs Symmetry" className="w-full rounded-lg" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Educational Content */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Brute Force O(n²)</CardTitle>
              <CardDescription>Check every possible combination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Tests every pair (i, j) from 1 to n. Simple but extremely slow for large numbers.
              </p>
              <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs">
                <div>for i in 1 to n:</div>
                <div className="ml-4">for j in 1 to n:</div>
                <div className="ml-8">if i × j = n:</div>
                <div className="ml-12">print(i, j)</div>
              </div>
              <p className="text-xs text-muted-foreground">
                For n=1,000,000: <strong className="text-red-500">1 trillion operations</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-500">Single Loop O(n)</CardTitle>
              <CardDescription>Calculate the partner directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                For each factor i, calculate j = n/i. No need for nested loops.
              </p>
              <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs">
                <div>for i in 1 to n:</div>
                <div className="ml-4">if n % i = 0:</div>
                <div className="ml-8">j = n / i</div>
                <div className="ml-8">print(i, j)</div>
              </div>
              <p className="text-xs text-muted-foreground">
                For n=1,000,000: <strong className="text-orange-500">1 million operations</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-500">Optimized O(√n)</CardTitle>
              <CardDescription>Use mathematical symmetry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Factors come in pairs around √n. Only check up to the square root.
              </p>
              <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs">
                <div>for i in 1 to √n:</div>
                <div className="ml-4">if n % i = 0:</div>
                <div className="ml-8">add (i, n/i)</div>
                <div className="ml-8">add (n/i, i)</div>
              </div>
              <p className="text-xs text-muted-foreground">
                For n=1,000,000: <strong className="text-green-500">1,000 operations</strong>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Key Insight */}
        <section>
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>The Key Insight: Mathematical Thinking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The O(√n) solution isn't just faster code—it's <strong>better thinking</strong>. It recognizes that factors always come in pairs around the square root:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>For every factor i ≤ √n, there's exactly one partner j ≥ √n where i × j = n</li>
                <li>Checking beyond √n only finds duplicate pairs in reverse order</li>
                <li>This mathematical insight reduces a trillion operations to just a thousand</li>
              </ul>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Real-World Impact:</p>
                <p className="text-sm text-muted-foreground">
                  This kind of thinking is what separates good developers from great ones. It's the difference between 
                  building systems that work and systems that scale effortlessly, saving companies millions in infrastructure costs.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Created by Varun Razdan • An Educational Tool for Understanding Algorithm Optimization</p>
        </div>
      </footer>
    </div>
  );
}

