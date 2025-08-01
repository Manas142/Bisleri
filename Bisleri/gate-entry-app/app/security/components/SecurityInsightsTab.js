// app/security/components/SecurityInsightsTab.js - UPDATED WITH 3-COLOR EDIT SYSTEM
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import styles from '../styles/insightsStyles';
import { insightsAPI, handleAPIError, editStatusUtils } from '../../../services/api';
import { getCurrentUser } from '../../../utils/jwtUtils';
import OperationalEditModal from './OperationalEditModal';

const SecurityInsightsTab = ({ 
  insightsData, 
  onDataChange 
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]);
  const [userData, setUserData] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatistics, setEditStatistics] = useState(null);

  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  // Vehicle filter state
  const [vehicleFilter, setVehicleFilter] = useState('');

  // Load initial data
  useEffect(() => {
    loadUserData();
    loadMovements();
    loadEditStatistics();
  }, []);

  // Helper function to format date as YYYY-MM-DD for API
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to format date as DD-MM-YYYY for display
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

  // ✅ NEW: Load edit statistics
  const loadEditStatistics = async () => {
    try {
      const stats = await insightsAPI.getEditStatistics();
      setEditStatistics(stats);
    } catch (error) {
      console.error('Error loading edit statistics:', error);
    }
  };

  // ✅ UPDATED: Load movements with enhanced edit status
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
      
      // ✅ NEW: Sort by edit priority (Yellow -> Green -> Black)
      const sortedMovements = editStatusUtils.sortByEditPriority(response.results || []);
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
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  // Apply filters and reload data
  const handleApplyFilters = () => {
    loadMovements();
    loadEditStatistics();
  };

  // ✅ NEW: Enhanced stats calculation with operational focus
  const stats = React.useMemo(() => {
    if (!movements || movements.length === 0) {
      return {
        totalMovements: 0,
        uniqueVehicles: 0,
        needsCompletion: 0,
        completeAndEditable: 0,
        expired: 0,
        averageCompletionTime: 0
      };
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
    
    return {
      totalMovements: movements.length,
      uniqueVehicles,
      needsCompletion,
      completeAndEditable,
      expired,
      averageCompletionTime: editStatistics?.avg_edits_per_record || 0
    };
  }, [movements, editStatistics]);

  // ✅ NEW: Open edit modal with record
  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditModalVisible(true);
  };

  // ✅ NEW: Close edit modal
  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingRecord(null);
  };

  // ✅ NEW: Handle successful edit
  const handleEditSuccess = (response) => {
    // Refresh the movements list
    loadMovements();
    loadEditStatistics();
    
    console.log('Edit successful:', response);
  };

  // ✅ NEW: Render 3-color edit button
  const renderEditButton = (record) => {
    const buttonConfig = editStatusUtils.getButtonConfig(record);
    
    // Button color mapping
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

  // ✅ NEW: Render operational data cell with completion indicators
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

  return (
    <View style={styles.container}>
      {/* Card Container */}
      <View style={styles.card}>
        
        {/* ✅ UPDATED: Enhanced 4x1 Stats Cards with operational focus */}
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
        
        {/* Enhanced Filters */}
        <View style={styles.filters}>
          {/* From Date with Calendar */}
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
          
          {/* To Date with Calendar */}
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

          {/* Vehicle Number Filter */}
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

          {/* Search Button */}
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

        {/* ✅ NEW: Operational summary stats */}
        <View style={styles.operationalSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Completion Rate:</Text>
            <Text style={[styles.summaryValue, {color: '#28a745'}]}>
              {editStatistics ? `${editStatistics.completion_percentage}%` : '--'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Avg Edits:</Text>
            <Text style={styles.summaryValue}>
              {editStatistics?.avg_edits_per_record || 0}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Edited Today:</Text>
            <Text style={[styles.summaryValue, {color: '#007bff'}]}>
              {editStatistics?.edited_today || 0}
            </Text>
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Operational Data Management</Text>

        {/* ✅ UPDATED: Enhanced Table with Operational Fields */}
        <ScrollView horizontal style={styles.tableScrollContainer}>
          <View style={styles.tableContainer}>
            
            {/* Table Header - UPDATED with operational columns */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colGateEntry]}>Gate Entry No</Text>
              <Text style={[styles.tableHeaderCell, styles.colVehicle]}>Vehicle No</Text>
              <Text style={[styles.tableHeaderCell, styles.colMovement]}>Movement</Text>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
              <Text style={[styles.tableHeaderCell, styles.colTime]}>Time</Text>
              
              {/* ✅ NEW: Operational Data Columns */}
              <Text style={[styles.tableHeaderCell, styles.colDriverName]}>Driver Name</Text>
              <Text style={[styles.tableHeaderCell, styles.colKMReading]}>KM Reading</Text>
              <Text style={[styles.tableHeaderCell, styles.colLoaderNames]}>Loader Names</Text>
              
              <Text style={[styles.tableHeaderCell, styles.colWarehouse]}>Warehouse</Text>
              <Text style={[styles.tableHeaderCell, styles.colSecurity]}>Security Guard</Text>
              <Text style={[styles.tableHeaderCell, styles.colEditCount]}>Edit Count</Text>
              <Text style={[styles.tableHeaderCell, styles.colTimeRemaining]}>Time Remaining</Text>
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
                <Text style={styles.noDataText}>No movements found for the selected filters</Text>
              </View>
            ) : (
              movements.map((movement, index) => {
                const buttonConfig = editStatusUtils.getButtonConfig(movement);
                
                return (
                  <View key={movement.id || index} style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                    // ✅ NEW: Priority-based row highlighting
                    buttonConfig.priority === 'high' && styles.highPriorityRow
                  ]}>
                    <Text style={[styles.tableCell, styles.colGateEntry]}>{movement.gate_entry_no}</Text>
                    <Text style={[styles.tableCell, styles.colVehicle]}>{movement.vehicle_no || '--'}</Text>
                    <Text style={[styles.tableCell, styles.colMovement]}>{movement.movement_type}</Text>
                    <Text style={[styles.tableCell, styles.colDate]}>
                      {formatDateToDDMMYYYY(new Date(movement.date))}
                    </Text>
                    <Text style={[styles.tableCell, styles.colTime]}>{movement.time}</Text>
                    
                    {/* ✅ NEW: Operational Data Cells with completion indicators */}
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
                    
                    {/* ✅ NEW: Edit count with visual indicator */}
                    <Text style={[
                      styles.tableCell, 
                      styles.colEditCount,
                      movement.edit_count > 0 ? { color: '#28a745', fontWeight: 'bold' } : { color: '#6c757d' }
                    ]}>
                      {movement.edit_count || 0}
                    </Text>
                    
                    {/* ✅ NEW: Time remaining with color coding */}
                    <Text style={[
                      styles.tableCell, 
                      styles.colTimeRemaining,
                      buttonConfig.priority === 'high' ? { color: '#dc3545', fontWeight: 'bold' } :
                      buttonConfig.priority === 'medium' ? { color: '#ffc107', fontWeight: 'bold' } :
                      { color: '#6c757d' }
                    ]}>
                      {movement.time_remaining || 'Expired'}
                    </Text>
                    
                    {/* ✅ NEW: 3-Color Edit Button */}
                    <View style={[styles.tableCell, styles.colActions]}>
                      {renderEditButton(movement)}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* ✅ NEW: Operational Edit Modal */}
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