import React, { useState, useEffect, useRef } from 'react';
import { TextField, List, ListItem, ListItemText, Paper, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../services/api';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function highlightKeyword(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <b key={i} style={{color:'#e91e63'}}>{part}</b> : part
  );
}

const SearchBar = ({ onSelect }) => {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef();
  const debouncedKeyword = useDebounce(keyword, 300);

  useEffect(() => {
    if (debouncedKeyword.trim()) {
      setLoading(true);
      api.get(`/products/search?q=${encodeURIComponent(debouncedKeyword)}`)
        .then(res => {
          setSuggestions(res.data.data || []);
          setOpen(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [debouncedKeyword]);

  const handleSelect = (item) => {
    setKeyword('');
    setOpen(false);
    if (onSelect) onSelect(item);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <TextField
        inputRef={inputRef}
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        fullWidth
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {loading ? <CircularProgress size={20} /> : <IconButton><SearchIcon /></IconButton>}
            </InputAdornment>
          )
        }}
        onFocus={() => keyword && setOpen(true)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <Paper style={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 10, maxHeight: 320, overflowY: 'auto' }}>
          <List>
            {suggestions.map(item => (
              <ListItem button key={item.id_SanPham} onClick={() => handleSelect(item)}>
                <ListItemText
                  primary={highlightKeyword(item.tenSp, keyword)}
                  secondary={item.thuongHieu ? `Thương hiệu: ${item.thuongHieu}` : ''}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
};

export default SearchBar; 