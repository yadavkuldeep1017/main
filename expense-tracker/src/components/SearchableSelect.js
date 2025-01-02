import React, { useState } from 'react';
import Select from 'react-select';

const SearchableSelect = () => {
  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'elderberry', label: 'Elderberry' },
    { value: 'fig', label: 'Fig' },
    { value: 'grape', label: 'Grape' },
  ];

  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = (selected) => {
    setSelectedOption(selected);
  };

  return (
    <div>
      <h3>Searchable Select Dropdown</h3>
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isSearchable={true} // This allows search functionality
        placeholder="Search and select an item..."
      />
      {selectedOption && (
        <div>
          <strong>Selected Item:</strong> {selectedOption.label}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
