import usePlacesAutocomplete, {
  getGeocode,
  getLatLng
} from 'use-places-autocomplete'
import { Autocomplete } from '@mui/material'
import { TextField } from '@material-ui/core'

const AutocompleteInput = ({ label, value, onSelect }) => {
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete({ debounce: 300 })

  const handleSelect = async address => {
    setValue(address, false)
    clearSuggestions()

    const results = await getGeocode({ address })
    const { lat, lng } = await getLatLng(results[0])

    onSelect({
      lat,
      lng,
      address
    })
  }

  return (
    <Autocomplete
      freeSolo
      disableClearable
      options={status === 'OK' ? data.map(s => s.description) : []}
      onInputChange={(e, newVal) => setValue(newVal)}
      onChange={(e, newVal) => handleSelect(newVal)}
      PaperComponent={({ children }) => (
        <div style={{ backgroundColor: 'white', color: 'black' }}>
          {children}
        </div>
      )}
      componentsProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 4]
              }
            }
          ]
        }
      }}
      renderOption={(props, option) => (
        <li {...props} style={{ color: 'black' }}>
          {option}
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          fullWidth
          value={inputValue}
          placeholder={`Start typing ${label.toLowerCase()}`}
          InputProps={{
            ...params.InputProps,
            type: 'search',
            style: { color: 'black', backgroundColor: '#fff' }
          }}
          // InputLabelProps={{
          //   style: { color: 'black' }
          // }}
          // placeholderTextColor="black"
        />
      )}
    />
  )
}

export default AutocompleteInput
