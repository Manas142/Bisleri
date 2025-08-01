// app/security/manual-entry/ManualEntryFormStyles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },

  // Card wrapper
  card: {
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a365d',
  },

  // Form Rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  // Field widths
  field50: {
    width: '48%',
  },

  // Labels and inputs
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },

  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    fontSize: 14,
  },

  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingHorizontal: 20,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },

  submitButton: {
    backgroundColor: '#28a745',
  },

  clearButton: {
    backgroundColor: '#dc3545',
  },

  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  warningText: {
  fontSize: 12,
  color: '#ff6b6b',
  fontStyle: 'italic',
  marginTop: 4,
  },

  fieldFull: {
  width: '100%',
  marginBottom: 15,
  },

  inputDisabled: {
  backgroundColor: '#f5f5f5',
  color: '#666',
  },

  warningText: {
  fontSize: 12,
  color: '#ff6b6b',
  fontStyle: 'italic',
  marginTop: 4,
  },

  fieldFull: {
  width: '100%',
  marginBottom: 15,
  },

});

export default styles;