import React from 'react';
/* React-Bootstrap Components: InputGroup, Form */
import { InputGroup, Form } from 'react-bootstrap';
/* React-Bootstrap-Icons: Search */
import { Search } from 'react-bootstrap-icons';
import '../styles/theme.css';

/**
 * Reusable SearchBar component
 * @param {string} placeholder - Placeholder text for the search input
 * @param {string} value - Current search value
 * @param {function} onChange - Callback when input value changes
 */
const SearchBar = ({ placeholder = 'Search by title or tag...', value = '', onChange }) => {
  return (
    /* React-Bootstrap: InputGroup - groups the search icon with the input */
    <InputGroup className="search-bar-wrapper align-items-center px-3">
      {/* React-Bootstrap-Icons: Search icon */}
      <Search size={16} className="text-secondary" />
      {/* React-Bootstrap: Form.Control - the text input */}
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-transparent border-0 shadow-none py-2 text-sm"
      />
    </InputGroup>
  );
};

export default SearchBar;
