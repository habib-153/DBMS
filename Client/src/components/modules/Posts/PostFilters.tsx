"use client";

import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody,
} from "@heroui/react";
import { Search, Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PostFiltersProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  selectedDivision: string;
  setSelectedDivision: (value: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (value: string) => void;
  onClearFilters: () => void;
  showCard?: boolean;
}

const SortOptions = [
  { key: "createdAt", name: "Latest" },
  { key: "votes", name: "Most Upvoted" },
  { key: "verification", name: "Verification Score" },
];

export default function PostFilters({
  searchInput,
  setSearchInput,
  sort,
  setSort,
  selectedDivision,
  setSelectedDivision,
  selectedDistrict,
  setSelectedDistrict,
  onClearFilters,
  showCard = true,
}: PostFiltersProps) {
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );

  // Fetch divisions
  useEffect(() => {
    fetch("https://bdapi.vercel.app/api/v.1/division")
      .then((response) => response.json())
      .then((data) => setDivisions(data.data))
      .catch(() => toast.error("Failed to fetch divisions"));
  }, []);

  // Fetch districts when division changes
  useEffect(() => {
    if (selectedDivision) {
      fetch(`https://bdapi.vercel.app/api/v.1/district/${selectedDivision}`)
        .then((response) => response.json())
        .then((data) => setDistricts(data.data))
        .catch(() => toast.error("Failed to fetch districts"));
    } else {
      setDistricts([]);
      setSelectedDistrict("");
    }
  }, [selectedDivision, setSelectedDistrict]);

  const hasActiveFilters =
    searchInput || selectedDivision || selectedDistrict || sort !== "createdAt";

  const FiltersContent = () => (
    <div className="flex flex-col items-center justify-center lg:flex-row gap-4">
      {/* Search Input */}
      <Input
        className="lg:flex-1"
        classNames={{
          input: "bg-transparent",
          inputWrapper:
            "bg-gray-50 dark:bg-gray-800 border-1 border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 focus-within:border-brand-primary",
        }}
        placeholder="Search crime reports..."
        startContent={<Search className="text-gray-400" size={20} />}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      {/* Division Select */}
      <Select
        className="lg:w-48"
        label="Division"
        classNames={{
          trigger:
            "bg-gray-50 dark:bg-gray-800 border-1 border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 data-[focus=true]:border-brand-primary",
        }}
        placeholder="Select Division"
        selectedKeys={selectedDivision ? [selectedDivision] : []}
        startContent={<Filter className="text-gray-400" size={16} />}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;

          setSelectedDivision(selected || "");
        }}
      >
        {divisions.map((division) => (
          <SelectItem key={division.id}>{division.name}</SelectItem>
        ))}
      </Select>

      {/* District Select */}
      <Select
        className="lg:w-48"
        label="District"
        classNames={{
          trigger:
            "bg-gray-50 dark:bg-gray-800 border-1 border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 data-[focus=true]:border-brand-primary",
        }}
        isDisabled={!selectedDivision}
        placeholder="Select District"
        selectedKeys={selectedDistrict ? [selectedDistrict] : []}
        startContent={<Filter className="text-gray-400" size={16} />}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;

          setSelectedDistrict(selected || "");
        }}
      >
        {districts.map((district) => (
          <SelectItem key={district.id}>{district.name}</SelectItem>
        ))}
      </Select>

      {/* Sort Select */}
      <Select
        className="lg:w-44"
        classNames={{
          trigger:
            "bg-gray-50 dark:bg-gray-800 border-1 border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 data-[focus=true]:border-brand-primary",
        }}
        placeholder="Sort by"
        selectedKeys={[sort]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;

          setSort(selected);
        }}
      >
        {SortOptions.map((option) => (
          <SelectItem key={option.key}>{option.name}</SelectItem>
        ))}
      </Select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          className="lg:w-auto"
          color="danger"
          size="md"
          startContent={<X size={16} />}
          variant="flat"
          onClick={onClearFilters}
        >
          Clear
        </Button>
      )}
    </div>
  );

  if (!showCard) {
    return <FiltersContent />;
  }

  return (
    <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardBody className="p-6">
        <FiltersContent />
      </CardBody>
    </Card>
  );
}
