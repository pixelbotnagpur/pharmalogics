'use client';

import { Truck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface FulfillmentNodeProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  zip: string;
  setZip: (val: string) => void;
  country: string;
  setCountry: (val: string) => void;
  state: string;
  setState: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  countries: { value: string, label: string }[];
  states: { value: string, label: string }[];
  cities: string[];
}

export function FulfillmentNode({
  firstName, setFirstName,
  lastName, setLastName,
  address, setAddress,
  zip, setZip,
  country, setCountry,
  state, setState,
  city, setCity,
  countries, states, cities
}: FulfillmentNodeProps) {
  const inputClasses = "h-11 border-black/50 bg-transparent rounded-md focus-visible:ring-1 focus-visible:ring-primary/20";

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-headline font-normal flex items-center gap-3">
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary"><Truck className="h-4 w-4" /></div>
        Fulfillment Node
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[9px] font-bold uppercase tracking-[0.2em]">First Name</Label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClasses} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[9px] font-bold uppercase tracking-[0.2em]">Last Name</Label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClasses} />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-[9px] font-bold uppercase tracking-[0.2em]">Country</Label>
          <Select value={country} onValueChange={(val) => setCountry(val)}>
            <SelectTrigger className={inputClasses}><SelectValue placeholder="Select Country" /></SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-[9px] font-bold uppercase tracking-[0.2em]">Street Address</Label>
          <Input placeholder="123 Clinical Way" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
          <div className="space-y-1.5">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em]">State</Label>
            <Select value={state} onValueChange={(val) => setState(val)}>
              <SelectTrigger className={inputClasses}><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                {states.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em]">City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className={inputClasses}><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                {cities.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] font-bold uppercase tracking-[0.2em]">Zip Code</Label>
            <Input value={zip} onChange={(e) => setZip(e.target.value)} className={inputClasses} />
          </div>
        </div>
      </div>
    </section>
  );
}
