// app/security/components/SecurityInsightsTab.js - INLINE DROPDOWN VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import styles from '../styles/insightsStyles';
import { insightsAPI, handleAPIError, editStatusUtils } from '../../../services/api';
import { getCurrentUser } from '../../../utils/jwtUtils';
import OperationalEditModal from './OperationalEditModal';

const SecurityInsightsTab = ({ insightsData, onDataChange }) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]);
  const [userData, setUserData] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatistics, setEditStatistics] = useState(null);

  // ✅ NEW: Unassigned count and assignment states
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [availableDocuments, setAvailableDocuments] = useState({});
  const [selectedDocuments, setSelectedDocuments] = useState({});
  const [assignmentLoading, setAssignmentLoading] = useState({});

  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [vehicleFilter, setVehicleFilter] = useState('');

  useEffect(() => {
    loadUserData();
    loadMovements();
    loadEditStatistics();
    loadUnassignedCount(); // ✅ NEW
  }, []);

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateToDDMMYYYY = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setUserData(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadEditStatistics = async () => {
    try {
      const stats = await insightsAPI.getEditStatistics();
      setEditStatistics(stats);
    } catch (error) {
      console.error('Error loading edit statistics:', error);
    }
  };

  // ✅ NEW: Load unassigned count
  const loadUnassignedCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/unassigned-count`, {
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('access_token')}`
        }
      });
      const data = await response.json();
      setUnassignedCount(data.unassigned_count);
    } catch (error) {
      console.error('Error loading unassigned count:', error);
    }
  };

  const loadMovements = async () => {
    setLoading(true);
    try {
      const filter = {
        from_date: formatDateForAPI(fromDate),
        to_date: formatDateForAPI(toDate),
        warehouse_code: userData?.warehouse_code || null,
        vehicle_no: vehicleFilter.trim() || null,
        movement_type: null
      };

      const response = await insightsAPI.getFilteredMovements(filter);
      
      // Sort by assignment priority
      const sortedMovements = (response.results || []).sort((a, b) => {
        const aNeedsAssignment = a.document_type === "Manual Entry" && a.sub_document_type === "Pending Assignment";
        const bNeedsAssignment = b.document_type === "Manual Entry" && b.sub_document_type === "Pending Assignment";
        
        if (aNeedsAssignment && !bNeedsAssignment) return -1;
        if (!aNeedsAssignment && bNeedsAssignment) return 1;
        return 0;
      });
      
      setMovements(sortedMovements);
      
    } catch (error) {
      console.error('Error loading movements:', error);
      const errorMessage = handleAPIError(error);
      Alert.alert('Error', `Failed to load movements: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Date picker handlers
  const onFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(Platform.OS === 'ios');
    if (selectedDate) setFromDate(selectedDate);
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToDatePicker(Platform.OS === 'ios');
    if (selectedDate) setToDate(selectedDate);
  };

  const handleApplyFilters = () => {
    loadMovements();
    loadEditStatistics();
    loadUnassignedCount(); // ✅ NEW
  };

  // ✅ NEW: Load available documents for dropdown
  const loadAvailableDocuments = async (vehicleNo, recordId) => {
    if (availableDocuments[recordId]) return;

    setAssignmentLoading(prev => ({ ...prev, [recordId]: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/available-documents/${vehicleNo}`, {
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('access_token')}`
        }
      });
      const data = await response.json();
      
      setAvailableDocuments(prev => ({
        ...prev,
        [recordId]: data.documents || []
      }));
      
    } catch (error) {
      console.error('Error loading available documents:', error);
    } finally {
      setAssignmentLoading(prev => ({ ...prev, [recordId]: false }));
    }
  };

  // ✅ NEW: Handle document assignment
  const handleDocumentAssignment = async (recordId, documentNo) => {
    if (!recordId || !documentNo) {
      Alert.alert('Error', 'Please select a document to assign');
      return;
    }

    setAssignmentLoading(prev => ({ ...prev, [recordId]: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/assign-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await SecureStore.getItemAsync('access_token')}`
        },
        body: JSON.stringify({
          insights_record_id: recordId,
          document_no: documentNo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Assignment failed');
      }

      const result = await response.json();
      
      Alert.alert(
        'Success',
        `Document ${documentNo} assigned successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              loadMovements();
              loadUnassignedCount();
              
              // Clear cached data
              setAvailableDocuments(prev => {
                const newDocs = { ...prev };
                delete newDocs[recordId];
                return newDocs;
              });
              
              setSelectedDocuments(prev => {
                const newSelected = { ...prev };
                delete newSelected[recordId];
                return newSelected;
              });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error assigning document:', error);
      Alert.alert('Assignment Failed', error.message);
    } finally {
      setAssignmentLoading(prev => ({ ...prev, [recordId]: false }));
    }
  };

  // Check if record needs assignment
  const needsDocumentAssignment = (record) => {
    return record.document_type === "Manual Entry" && record.sub_document_type === "Pending Assignment";
  };

  // Check if assignment window is open (12 hours)
  const isAssignmentWindowOpen = (record) => {
    try {
      const entryDateTime = new Date(`${record.date}T${record.time}`);
      const now = new Date();
      const timeDiff = now - entryDateTime;
      return timeDiff <= 12 * 60 * 60 * 1000; // 12 hours in ms
    } catch (error) {
      return false;
    }
  };

  // ✅ NEW: Render inline document dropdown
  const renderDocumentDropdown = (record) => {
    if (!needsDocumentAssignment(record)) {
      return (
        <Text style={styles.assignedDocumentText}>
          {record.document_type || '--'}
        </Text>
      );
    }

    if (!isAssignmentWindowOpen(record)) {
      return <Text style={styles.expiredText}>⚫ Expired</Text>;
    }

    const recordId = record.id;
    const documents = availableDocuments[recordId] || [];
    const selectedDoc = selectedDocuments[recordId];
    const isLoading = assignmentLoading[recordId];

    // Load documents when dropdown is first rendered
    React.useEffect(() => {
      if (needsDocumentAssignment(record) && isAssignmentWindowOpen(record)) {
        loadAvailableDocuments(record.vehicle_no, recordId);
      }
    }, [record.vehicle_no, recordId]);

    if (isLoading) {
      return (
        <View style={styles.loadingCell}>
          <ActivityIndicator size="small" color="#007bff" />
        </View>
      );
    }

    return (
      <View style={styles.inlinePickerContainer}>
        <Picker
          selectedValue={selectedDoc || ''}
          onValueChange={(value) => {
            if (value) {
              setSelectedDocuments(prev => ({
                ...prev,
                [recordId]: value
              }));
            }
          }}
          style={styles.inlinePicker}
          mode="dropdown"
        >
          <Picker.Item label="Select Document" value="" />
          {documents.map((doc) => (
            <Picker.Item 
              key={doc.document_no} 
              label={`${doc.document_no} - ${doc.document_type}`} 
              value={doc.document_no} 
            />
          ))}
        </Picker>
      </View>
    );
  };

  // ✅ NEW: Render submit button
  const renderSubmitButton = (record) => {
    if (!needsDocumentAssignment(record) || !isAssignmentWindowOpen(record)) {
      const editButtonConfig = editStatusUtils.getButtonConfig(record);
      return renderEditButton(record, editButtonConfig);
    }

    const recordId = record.id;
    const selectedDoc = selectedDocuments[recordId];
    const isLoading = assignmentLoading[recordId];

    return (
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!selectedDoc || isLoading) && styles.submitButtonDisabled
        ]}
        onPress={() => handleDocumentAssignment(recordId, selectedDoc)}
        disabled={!selectedDoc || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {selectedDoc ? 'Submit' : 'Select First'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Existing edit modal handlers
  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingRecord(null);
  };

  const handleEditSuccess = (response) => {
    loadMovements();
    loadEditStatistics();
  };

  const renderEditButton = (record, buttonConfig) => {
    const colorStyles = {
      yellow: styles.completeInfoButton,
      green: styles.editDetailsButton,
      black: styles.expiredButton,
      gray: styles.noAccessButton
    };
    
    const buttonStyle = colorStyles[buttonConfig.color] || styles.defaultButton;
    
    return (
      <TouchableOpacity 
        style={[styles.actionButton, buttonStyle]}
        onPress={() => buttonConfig.enabled ? openEditModal(record) : null}
        disabled={!buttonConfig.enabled}
      >
        <Text style={[
          styles.actionButtonText,
          !buttonConfig.enabled && styles.disabledButtonText
        ]}>
          {buttonConfig.text}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderOperationalCell = (record, field) => {
    const value = record[field];
    const hasValue = value && value.trim();
    const isRequired = editStatusUtils.getButtonConfig(record).missing_fields?.includes(field.replace('_', ' '));
    
    return (
      <Text style={[
        styles.tableCell,
        hasValue ? styles.completeField : styles.incompleteField,
        isRequired && styles.requiredField
      ]}>
        {hasValue ? value : (isRequired ? '⚠️ Required' : '--')}
      </Text>
    );
  };

  const stats = React.useMemo(() => {
    if (!movements || movements.length === 0) {
      return { totalMovements: 0, uniqueVehicles: 0, needsCompletion: 0, completeAndEditable: 0, expired: 0 };
    }
    
    const uniqueVehicles = [...new Set(movements.map(m => m.vehicle_no))].length;
    const needsCompletion = movements.filter(m => 
      editStatusUtils.getButtonConfig(m).action === 'complete_required'
    ).length;
    const completeAndEditable = movements.filter(m => 
      editStatusUtils.getButtonConfig(m).action === 'edit_optional'
    ).length;
    const expired = movements.filter(m => 
      editStatusUtils.getButtonConfig(m).action === 'view_only'
    ).length;
    
    return { totalMovements: movements.length, uniqueVehicles, needsCompletion, completeAndEditable, expired };
  }, [movements, editStatistics]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* ✅ NEW: Unassigned Count Display */}
        <View style={styles.unassignedCountBanner}>
          <Text style={styles.unassignedCountText}>
            📋 Unassigned Documents: {unassignedCount}
          </Text>
          <Text style={styles.unassignedCountSubtext}>
            Manual entries requiring document assignment within 12 hours
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsCardsContainer}>
          <View style={styles.statsRowContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalMovements}</Text>
              <Text style={styles.statLabel}>Total Movements</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#ffc107' }]}>
              <Text style={styles.statNumber}>{stats.needsCompletion}</Text>
              <Text style={styles.statLabel}>Need Completion</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#28a745' }]}>
              <Text style={styles.statNumber}>{stats.completeAndEditable}</Text>
              <Text style={styles.statLabel}>Complete & Editable</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#6c757d' }]}>
              <Text style={styles.statNumber}>{stats.expired}</Text>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
          </View>
        </View>
        
        {/* Filters */}
        <View style={styles.filters}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>From Date</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowFromDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {formatDateToDDMMYYYY(fromDate)}
              </Text>
            </TouchableOpacity>
            
            {showFromDatePicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onFromDateChange}
              />
            )}
          </View>
          
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>To Date</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowToDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {formatDateToDDMMYYYY(toDate)}
              </Text>
            </TouchableOpacity>
            
            {showToDatePicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onToDateChange}
              />
            )}
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Vehicle Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter vehicle no"
              value={vehicleFilter}
              onChangeText={setVehicleFilter}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.filterItem}>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleApplyFilters}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Document Assignment & Operational Data</Text>

        {/* ✅ INLINE TABLE with Native Dropdowns */}
        <ScrollView horizontal style={styles.tableScrollContainer}>
          <View style={styles.tableContainer}>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colGateEntry]}>Gate Entry No</Text>
              <Text style={[styles.tableHeaderCell, styles.colVehicle]}>Vehicle No</Text>
              <Text style={[styles.tableHeaderCell, styles.colMovement]}>Movement</Text>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
              <Text style={[styles.tableHeaderCell, styles.colTime]}>Time</Text>
              <Text style={[styles.tableHeaderCell, styles.colDocumentDropdown]}>Document Assignment</Text>
              <Text style={[styles.tableHeaderCell, styles.colDocumentType]}>Document Type</Text>
              <Text style={[styles.tableHeaderCell, styles.colDriverName]}>Driver Name</Text>
              <Text style={[styles.tableHeaderCell, styles.colKMReading]}>KM Reading</Text>
              <Text style={[styles.tableHeaderCell, styles.colLoaderNames]}>Loader Names</Text>
              <Text style={[styles.tableHeaderCell, styles.colWarehouse]}>Warehouse</Text>
              <Text style={[styles.tableHeaderCell, styles.colSecurity]}>Security Guard</Text>
              <Text style={[styles.tableHeaderCell, styles.colActions]}>Actions</Text>
            </View>

            {/* Table Rows */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Loading movements...</Text>
              </View>
            ) : movements.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No movements found</Text>
              </View>
            ) : (
              movements.map((movement, index) => {
                const needsAssignment = needsDocumentAssignment(movement);
                
                return (
                  <View key={movement.id || index} style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                    needsAssignment && styles.pendingAssignmentRow // ✅ YELLOW HIGHLIGHTING
                  ]}>
                    <Text style={[styles.tableCell, styles.colGateEntry]}>{movement.gate_entry_no}</Text>
                    <Text style={[styles.tableCell, styles.colVehicle]}>{movement.vehicle_no || '--'}</Text>
                    <Text style={[styles.tableCell, styles.colMovement]}>{movement.movement_type}</Text>
                    <Text style={[styles.tableCell, styles.colDate]}>
                      {formatDateToDDMMYYYY(new Date(movement.date))}
                    </Text>
                    <Text style={[styles.tableCell, styles.colTime]}>{movement.time}</Text>
                    
                    {/* ✅ INLINE DROPDOWN CELL */}
                    <View style={[styles.tableCell, styles.colDocumentDropdown]}>
                      {renderDocumentDropdown(movement)}
                    </View>
                    
                    <Text style={[styles.tableCell, styles.colDocumentType]}>
                      {movement.document_type || '--'}
                    </Text>
                    
                    <View style={[styles.tableCell, styles.colDriverName]}>
                      {renderOperationalCell(movement, 'driver_name')}
                    </View>
                    <View style={[styles.tableCell, styles.colKMReading]}>
                      {renderOperationalCell(movement, 'km_reading')}
                    </View>
                    <View style={[styles.tableCell, styles.colLoaderNames]}>
                      {renderOperationalCell(movement, 'loader_names')}
                    </View>
                    
                    <Text style={[styles.tableCell, styles.colWarehouse]}>{movement.warehouse_name}</Text>
                    <Text style={[styles.tableCell, styles.colSecurity]}>{movement.security_name}</Text>
                    
                    {/* ✅ SUBMIT BUTTON CELL */}
                    <View style={[styles.tableCell, styles.colActions]}>
                      {renderSubmitButton(movement)}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* Existing Operational Edit Modal */}
      <OperationalEditModal
        visible={editModalVisible}
        record={editingRecord}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />
    </View>
  );
};

export default SecurityInsightsTab;