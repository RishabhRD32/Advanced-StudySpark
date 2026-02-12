
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Scale, 
  Ruler, 
  Thermometer, 
  Zap, 
  Clock, 
  HardDrive, 
  Droplets, 
  ArrowRightLeft,
  Square,
  Gauge,
  Activity,
  Binary
} from "lucide-react";

type UnitCategory = 'length' | 'mass' | 'temperature' | 'area' | 'volume' | 'time' | 'digital' | 'speed' | 'energy' | 'numeral';

const UNIT_DATA: Record<UnitCategory, { label: string, icon: any, units: Record<string, number | ((val: number, to: boolean) => number)> }> = {
  numeral: {
    label: 'Numeral',
    icon: <Binary className="h-5 w-5" />,
    units: {
      'Decimal (10)': 10,
      'Binary (2)': 2,
      'Hexadecimal (16)': 16,
      'Octal (8)': 8
    }
  },
  length: {
    label: 'Length',
    icon: <Ruler className="h-5 w-5" />,
    units: {
      'Meter (m)': 1,
      'Kilometer (km)': 1000,
      'Centimeter (cm)': 0.01,
      'Millimeter (mm)': 0.001,
      'Micrometer (μm)': 0.000001,
      'Nanometer (nm)': 0.000000001,
      'Mile (mi)': 1609.34,
      'Nautical Mile (nmi)': 1852,
      'Yard (yd)': 0.9144,
      'Foot (ft)': 0.3048,
      'Inch (in)': 0.0254,
      'Light Year (ly)': 9460730472580800
    }
  },
  mass: {
    label: 'Mass',
    icon: <Scale className="h-5 w-5" />,
    units: {
      'Kilogram (kg)': 1,
      'Gram (g)': 0.001,
      'Milligram (mg)': 0.000001,
      'Microgram (μg)': 0.000000001,
      'Pound (lb)': 0.453592,
      'Ounce (oz)': 0.0283495,
      'Stone (st)': 6.35029,
      'Metric Ton (t)': 1000,
      'Carat (ct)': 0.0002
    }
  },
  temperature: {
    label: 'Temperature',
    icon: <Thermometer className="h-5 w-5" />,
    units: {
      'Celsius (°C)': (val: number, to: boolean) => to ? val : val,
      'Fahrenheit (°F)': (val: number, to: boolean) => to ? (val * 9/5) + 32 : (val - 32) * 5/9,
      'Kelvin (K)': (val: number, to: boolean) => to ? val + 273.15 : val - 273.15
    }
  },
  area: {
    label: 'Area',
    icon: <Square className="h-5 w-5" />,
    units: {
      'Square Meter (m²)': 1,
      'Square Kilometer (km²)': 1000000,
      'Square Mile (mi²)': 2589988.11,
      'Square Foot (ft²)': 0.092903,
      'Square Inch (in²)': 0.00064516,
      'Square Yard (yd²)': 0.836127,
      'Acre (ac)': 4046.86,
      'Hectare (ha)': 10000
    }
  },
  volume: {
    label: 'Volume',
    icon: <Droplets className="h-5 w-5" />,
    units: {
      'Liter (L)': 1,
      'Milliliter (mL)': 0.001,
      'Cubic Meter (m³)': 1000,
      'Gallon (gal)': 3.78541,
      'Quart (qt)': 0.946353,
      'Pint (pt)': 0.473176,
      'Cup': 0.236588,
      'Fluid Ounce (fl oz)': 0.0295735,
      'Tablespoon (tbsp)': 0.0147868,
      'Teaspoon (tsp)': 0.00492892
    }
  },
  time: {
    label: 'Time',
    icon: <Clock className="h-5 w-5" />,
    units: {
      'Millisecond (ms)': 0.001,
      'Second (s)': 1,
      'Minute (min)': 60,
      'Hour (hr)': 3600,
      'Day (d)': 86400,
      'Week (wk)': 604800,
      'Month (mo)': 2629746,
      'Year (yr)': 31556952,
      'Decade': 315569520,
      'Century': 3155695200
    }
  },
  digital: {
    label: 'Storage',
    icon: <HardDrive className="h-5 w-5" />,
    units: {
      'Bit (b)': 0.125,
      'Byte (B)': 1,
      'Kilobit (kb)': 125,
      'Kibibit (Kib)': 128,
      'Kilobyte (KB)': 1000,
      'Kibibyte (KiB)': 1024,
      'Megabit (Mb)': 125000,
      'Mebibit (Mib)': 131072,
      'Megabyte (MB)': 1000000,
      'Mebibyte (MiB)': 1048576,
      'Gigabit (Gb)': 125000000,
      'Gibibit (Gib)': 134217728,
      'Gigabyte (GB)': 1000000000,
      'Gibibyte (GiB)': 1073741824,
      'Terabit (Tb)': 125000000000,
      'Tebibit (Tib)': 137438953472,
      'Terabyte (TB)': 1000000000000,
      'Tebibyte (TiB)': 1099511627776,
      'Petabyte (PB)': 1000000000000000,
      'Pebibyte (PiB)': 1125899906842624,
      'Exabyte (EB)': 1e18,
      'Zettabyte (ZB)': 1e21,
      'Yottabyte (YB)': 1e24
    }
  },
  speed: {
    label: 'Speed',
    icon: <Gauge className="h-5 w-5" />,
    units: {
      'Meters/sec (m/s)': 1,
      'Kilometers/hour (km/h)': 0.277778,
      'Miles/hour (mph)': 0.44704,
      'Knots (kn)': 0.514444,
      'Mach': 340.3
    }
  },
  energy: {
    label: 'Energy',
    icon: <Activity className="h-5 w-5" />,
    units: {
      'Joule (J)': 1,
      'Kilojoule (kJ)': 1000,
      'Calorie (cal)': 4.184,
      'Kilocalorie (kcal)': 4184,
      'Watt-hour (Wh)': 3600,
      'Kilowatt-hour (kWh)': 3600000
    }
  }
};

export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('1');
  const [result, setResult] = useState<string>('0');

  useEffect(() => {
    const units = Object.keys(UNIT_DATA[category].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  }, [category]);

  useEffect(() => {
    handleConvert();
  }, [inputValue, fromUnit, toUnit, category]);

  const handleConvert = () => {
    if (!fromUnit || !toUnit || !UNIT_DATA[category]) return;

    if (category === 'numeral') {
      const fb = UNIT_DATA[category].units[fromUnit] as number;
      const tb = UNIT_DATA[category].units[toUnit] as number;
      try {
        const decimal = parseInt(inputValue, fb);
        if (isNaN(decimal)) {
          setResult('NaN');
        } else {
          setResult(decimal.toString(tb).toUpperCase());
        }
      } catch (e) {
        setResult('Error');
      }
      return;
    }

    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setResult('0');
      return;
    }

    const units = UNIT_DATA[category].units;
    const fromFactor = units[fromUnit];
    const toFactor = units[toUnit];

    if (fromFactor === undefined || toFactor === undefined) return;

    let baseValue = 0;

    if (category === 'temperature') {
      const fromFn = fromFactor as (v: number, t: boolean) => number;
      const toFn = toFactor as (v: number, t: boolean) => number;
      
      if (typeof fromFn !== 'function' || typeof toFn !== 'function') return;

      baseValue = fromFn(val, false);
      const final = toFn(baseValue, true);
      setResult(final.toFixed(4).replace(/\.?0+$/, ""));
    } else {
      baseValue = val * (fromFactor as number);
      const final = baseValue / (toFactor as number);
      if (final > 1e12 || (final < 1e-6 && final > 0)) {
        setResult(final.toExponential(4));
      } else {
        setResult(final.toFixed(6).replace(/\.?0+$/, ""));
      }
    }
  };

  const swapUnits = () => {
    if (!fromUnit || !toUnit) return;
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <ArrowRightLeft className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Metric Matrix</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          High-precision algorithmic conversion for scientific metrics and numeral systems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-2">Category</p>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(UNIT_DATA) as UnitCategory[]).map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? 'default' : 'ghost'}
                onClick={() => setCategory(cat)}
                className="justify-start h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-4 transition-all"
              >
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center border-2 ${category === cat ? 'bg-white/20 border-white' : 'bg-primary/5 border-primary/10 text-primary'}`}>
                  {UNIT_DATA[cat].icon}
                </div>
                {UNIT_DATA[cat].label}
              </Button>
            ))}
          </div>
        </div>

        <Card className="md:col-span-3 border-4 shadow-2xl rounded-[3rem] bg-card/40 backdrop-blur-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b-4 border-primary/5 p-10">
            <div className="flex items-center gap-4">
              <Zap className="h-6 w-6 text-primary fill-primary/20 animate-bolt" />
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Logic Engine Active</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-end">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">From</Label>
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger className="h-16 border-4 rounded-2xl font-black text-lg bg-background shadow-inner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-4 font-bold max-h-[300px]">
                    {Object.keys(UNIT_DATA[category].units).map(u => (
                      <SelectItem key={u} value={u} className="py-3 font-bold">{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  type={category === 'numeral' ? "text" : "number"}
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)}
                  className="h-20 border-4 rounded-[2rem] text-4xl font-black text-center focus-visible:ring-primary shadow-xl uppercase"
                />
              </div>

              <div className="flex flex-col items-center gap-10">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={swapUnits}
                  className="h-14 w-14 rounded-full border-4 hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
                >
                  <ArrowRightLeft className="h-6 w-6 rotate-90 sm:rotate-0" />
                </Button>

                <div className="w-full space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">To</Label>
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger className="h-16 border-4 rounded-2xl font-black text-lg bg-background shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-4 font-bold max-h-[300px]">
                      {Object.keys(UNIT_DATA[category].units).map(u => (
                        <SelectItem key={u} value={u} className="py-3 font-bold">{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="h-20 rounded-[2rem] bg-primary/5 border-4 border-dashed border-primary/20 flex items-center justify-center px-6 overflow-hidden">
                    <span className="text-4xl font-black text-primary tabular-nums truncate uppercase">{result}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t-4 border-dashed flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-xs tracking-widest leading-relaxed">
                Result is calculated using verified mathematical constants. 
                Numeral system conversions handle non-numeric input characters.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
