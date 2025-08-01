// app/security/styles/insightsStyles.js - COMPLETE WITH 3-COLOR EDIT SYSTEM
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

  // ✅ NEW: 4x1 Stats Cards Styling with operational focus
  statsCardsContainer: {
    marginBottom: 20,
    paddingHorizontal: 12,
  },

  statsRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statCard: {
    flex: 1,
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },

  // Enhanced Filters (UPDATED for calendar)
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
    minWidth: 120,
    maxWidth: 180, // Limit width for better layout
  },
  
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
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

  // ✅ NEW: Date picker button styles
  datePickerButton: {
    borderColor: '#aaa',
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },

  datePickerText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  searchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    marginTop: 20, // Add top margin to align with date inputs
  },

  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // ✅ NEW: Operational Summary Section
  operationalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },

  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  summaryItem: {
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1a365d',
  },

  // Enhanced Table Styles
  tableScrollContainer: {
    maxHeight: 500,
  },

  tableContainer: {
    minWidth: 1600, // ✅ INCREASED for new operational columns
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  tableHeaderCell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    minHeight: 50,
    alignItems: 'center',
  },

  evenRow: {
    backgroundColor: '#f8f9fa',
  },

  oddRow: {
    backgroundColor: 'white',
  },

  tableCell: {
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },

  // ✅ UPDATED: Column Widths including new operational columns
  colGateEntry: { width: 150 },
  colVehicle: { width: 120 },
  colDocType: { width: 100 },
  colDate: { width: 100 },
  colTime: { width: 80 },
  colMovement: { width: 90 },
  colWarehouse: { width: 150 },
  colSecurity: { width: 120 },
  colStatus: { width: 140 },
  colRemarks: { width: 140 },
  colDocumentDate: { width: 160 },  
  colDocumentAge: { width: 120 },
  
  // ✅ NEW: Operational Column Widths
  colDriverName: { width: 140 },
  colKMReading: { width: 100 },
  colLoaderNames: { width: 160 },
  colEditCount: { width: 80 },
  colTimeRemaining: { width: 120 },
  colActions: { width: 130 }, // ✅ INCREASED for new button text

  // ✅ NEW: 3-Color Edit Button System
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110, // ✅ INCREASED for longer button text
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  completeInfoButton: {
    backgroundColor: '#ffc107',     // YELLOW - High Priority
    borderWidth: 2,
    borderColor: '#ffca2c',
    shadowColor: '#ffc107',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  editDetailsButton: {
    backgroundColor: '#28a745',     // GREEN - Available
    borderWidth: 2,
    borderColor: '#34ce57',
    shadowColor: '#28a745',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  expiredButton: {
    backgroundColor: '#6c757d',     // BLACK/GRAY - Expired
    borderWidth: 2,
    borderColor: '#868e96',
    opacity: 0.7,
  },

  noAccessButton: {
    backgroundColor: '#343a40',     // DARK GRAY - No Access
    borderWidth: 2,
    borderColor: '#495057',
    opacity: 0.6,
  },

  defaultButton: {
    backgroundColor: '#007bff',     // BLUE - Fallback
    borderWidth: 2,
    borderColor: '#0056b3',
  },

  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },

  // ✅ NEW: Button text states
  disabledButtonText: {
    color: '#ffffff',
    opacity: 0.7,
  },

  // ✅ NEW: Row highlighting for high priority records
  highPriorityRow: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },

  mediumPriorityRow: {
    backgroundColor: '#d1edff',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },

  expiredRow: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#6c757d',
    opacity: 0.8,
  },

  // ✅ NEW: Operational Data Cell Styling
  completeField: {
    color: '#28a745',
    fontWeight: 'bold',
    backgroundColor: '#f8fff8',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  incompleteField: {
    color: '#dc3545',
    fontStyle: 'italic',
    backgroundColor: '#fff5f5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  requiredField: {
    color: '#dc3545',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  // ✅ NEW: Priority Indicators
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  highPriorityIndicator: {
    backgroundColor: '#ffc107',
  },

  mediumPriorityIndicator: {
    backgroundColor: '#28a745',
  },

  lowPriorityIndicator: {
    backgroundColor: '#6c757d',
  },

  // ✅ NEW: Completion Progress Styling
  completionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },

  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },

  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#28a745',
    minWidth: 40,
  },

  // ✅ NEW: Field Status Icons
  fieldStatusIcon: {
    fontSize: 12,
    marginLeft: 4,
  },

  completeIcon: {
    color: '#28a745',
  },

  incompleteIcon: {
    color: '#dc3545',
  },

  optionalIcon: {
    color: '#6c757d',
  },

  // ✅ NEW: Edit Window Warning Styles
  editWindowWarning: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },

  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },

  warningText: {
    fontSize: 13,
    color: '#856404',
  },

  // ✅ NEW: Quick Filter Buttons
  quickFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  quickFilterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },

  quickFilterActive: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3',
  },

  quickFilterInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#ced4da',
  },

  quickFilterText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  quickFilterTextActive: {
    color: '#ffffff',
  },

  quickFilterTextInactive: {
    color: '#6c757d',
  },

  // ✅ NEW: Bulk Action Buttons
  bulkActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },

  bulkActionButton: {
    backgroundColor: '#17a2b8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },

  bulkActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // ✅ NEW: Legend for 3-Color System
  colorLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },

  legendText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },

  // ✅ NEW: Time-based Styling
  urgentTimeRemaining: {
    color: '#dc3545',
    fontWeight: 'bold',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },

  warningTimeRemaining: {
    color: '#ffc107',
    fontWeight: 'bold',
    backgroundColor: '#fff9c4',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },

  normalTimeRemaining: {
    color: '#28a745',
    fontWeight: '500',
  },

  expiredTimeRemaining: {
    color: '#6c757d',
    fontStyle: 'italic',
  },

  // ✅ NEW: Data Quality Indicators
  dataQualityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },

  highQualityBadge: {
    backgroundColor: '#d4edda',
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },

  mediumQualityBadge: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },

  lowQualityBadge: {
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },

  qualityBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  highQualityText: {
    color: '#155724',
  },

  mediumQualityText: {
    color: '#856404',
  },

  lowQualityText: {
    color: '#721c24',
  },

  // ✅ NEW: Enhanced Loading States
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  priorityLoadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },

  loadingProgress: {
    marginTop: 16,
    alignItems: 'center',
  },

  loadingStep: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },

  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // ✅ NEW: Special Styling for KM Readings
  kmReadingCell: {
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  kmReadingComplete: {
    color: '#28a745',
    fontWeight: 'bold',
  },

  kmReadingMissing: {
    color: '#dc3545',
    fontStyle: 'italic',
  },

  // ✅ NEW: Loader Names Special Styling
  loaderNamesCell: {
    maxWidth: 160,
    overflow: 'hidden',
  },

  loaderNamesText: {
    fontSize: 11,
    lineHeight: 13,
  },

  multipleLoaders: {
    color: '#007bff',
    fontWeight: 'bold',
  },

  singleLoader: {
    color: '#28a745',
  },

  noLoaders: {
    color: '#dc3545',
    fontStyle: 'italic',
  },

  // ✅ NEW: Accessibility Enhancements
  accessibleActionButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  screenReaderText: {
    position: 'absolute',
    left: -10000,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },

  // ✅ NEW: Animation States for Button Transitions
  buttonTransition: {
    transition: 'all 0.3s ease',
  },

  pulseAnimation: {
    // Note: React Native doesn't support CSS animations directly
    // This would need to be implemented with Animated API
    transform: [{ scale: 1.05 }],
  },

  // ✅ NEW: Character Count Display
  characterCount: {
    fontSize: 11,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4,
  },

  characterCountWarning: {
    color: '#ffc107',
  },

  characterCountError: {
    color: '#dc3545',
  },

  // ✅ NEW: KM Reading Special Styling
  kmReadingContainer: {
    position: 'relative',
  },

  kmReadingInput: {
    paddingRight: 60, // Space for units display
  },

  kmUnitsLabel: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontSize: 14,
    color: '#6c757d',
    fontWeight: 'bold',
  },

  // ✅ NEW: Field Priority Indicators
  highPriorityField: {
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    paddingLeft: 12,
  },

  mediumPriorityField: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    paddingLeft: 12,
  },

  // ✅ NEW: Success Indicators
  fieldCompleted: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff8',
  },

  completionCheckmark: {
    position: 'absolute',
    right: 8,
    top: 8,
    color: '#28a745',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ✅ NEW: Form Progress Indicator
  progressContainer: {
    backgroundColor: '#e9ecef',
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 3,
  },

  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },

  // ✅ NEW: Quick Action Buttons
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },

  quickActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#007bff',
  },

  quickActionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // ✅ RESPONSIVE: Mobile stacking for stats cards
  '@media (max-width: 768px)': {
    // Stack operational fields vertically on small screens
    operationalSummary: {
      flexDirection: 'column',
      gap: 8,
    },
    
    quickFilterRow: {
      flexDirection: 'column',
      gap: 8,
    },
    
    quickFilterButton: {
      width: '100%',
    },
    
    colorLegend: {
      flexDirection: 'column',
      gap: 8,
    },
    
    // Adjust column widths for mobile
    colDriverName: { width: 120 },
    colKMReading: { width: 80 },
    colLoaderNames: { width: 140 },
    colTimeRemaining: { width: 100 },
    
    filters: {
      flexDirection: 'column',
    },
    
    filterItem: {
      marginBottom: 10,
      width: '100%',
    },
    
    summaryContainer: {
      flexDirection: 'column',
      gap: 8,
    },
    
    statsRowContainer: {
      flexDirection: 'column',
      gap: 12,
    },
    
    statCard: {
      width: '100%',
      marginHorizontal: 0,
    },
    
    statNumber: {
      fontSize: 32,
    },
    
    statLabel: {
      fontSize: 14,
    },
  },

  // ✅ RESPONSIVE: Tablet Design (Redmi Pad 2 specific)
  '@media (min-width: 769px) and (max-width: 1024px)': {
    tableHeaderCell: {
      fontSize: 11,
    },
    
    tableCell: {
      fontSize: 10,
    },
    
    actionButton: {
      minWidth: 100,
      paddingHorizontal: 10,
    },
    
    actionButtonText: {
      fontSize: 10,
    },
  },

  // Status Indicators
  statusIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  statusNeedsEdit: {
    backgroundColor: '#ffeaa7',
    color: '#d63031',
  },

  statusEditable: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },

  statusComplete: {
    backgroundColor: '#d1edff',
    color: '#155724',
  },

  statusExpired: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
});

export default styles;