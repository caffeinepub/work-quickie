import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import TagInput from './TagInput';

export interface FilterState {
  keyword: string;
  skills: string[];
  location: string;
  jobType: string;
  minPay: number;
  maxPay: number;
}

interface JobFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const DEFAULT_FILTERS: FilterState = {
  keyword: '',
  skills: [],
  location: '',
  jobType: '',
  minPay: 0,
  maxPay: 100000,
};

export default function JobFilters({ filters, onChange, onReset }: JobFiltersProps) {
  const update = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial });

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground h-7 px-2">
          <X className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
      </div>

      {/* Keyword */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Job title or keyword..."
            value={filters.keyword}
            onChange={(e) => update({ keyword: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</Label>
        <Input
          placeholder="City, region, or remote..."
          value={filters.location}
          onChange={(e) => update({ location: e.target.value })}
        />
      </div>

      {/* Job Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Job Type</Label>
        <Select value={filters.jobType} onValueChange={(v) => update({ jobType: v === 'all' ? '' : v })}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="FullTime">Full-Time</SelectItem>
            <SelectItem value="PartTime">Part-Time</SelectItem>
            <SelectItem value="ShortTerm">Short-Term</SelectItem>
            <SelectItem value="Artisan">Artisan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Skills */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Required Skills</Label>
        <TagInput
          tags={filters.skills}
          onChange={(skills) => update({ skills })}
          placeholder="Add skill filter..."
        />
      </div>

      {/* Pay Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pay Range</Label>
          <span className="text-xs text-muted-foreground">
            ${filters.minPay.toLocaleString()} – ${filters.maxPay.toLocaleString()}
          </span>
        </div>
        <Slider
          min={0}
          max={100000}
          step={500}
          value={[filters.minPay, filters.maxPay]}
          onValueChange={([min, max]) => update({ minPay: min, maxPay: max })}
          className="mt-2"
        />
      </div>
    </div>
  );
}
