// app/security/manual-entry/ManualEntryForm.js - UPDATED (ONLY VEHICLE NUMBER MANDATORY)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { gateAPI, handleAPIError } from '../../../services/api';
import styles from './ManualEntryFormStyles';

const ManualEntryForm = ({ userData }) => {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ Get vehicle number from URL parameters (when navigated from Gate Entry)
  const preFilledVehicleNo = searchParams.vehicle || '';
  
  // ✅ UPDATED: Form state - only vehicle number is mandatory
  const [formData, setFormData] = useState({
    vehicleNo: preFilledVehicleNo.toUpperCase(), // ✅ Pre-filled and mandatory
    documentType: '',        // ✅ OPTIONAL
    documentNo: '',          // ✅ OPTIONAL
    documentDate: new Date().toISOString().split('T')[0],
    customerCode: '',
    customerName: '',
    warehouseCode: userData?.warehouseCode || '',
    warehouseName: userData?.warehouseName || '',
    totalQuantity: '',
    transporterName: '',
    eWayBillNo: '',
    routeCode: '',
    siteCode: userData?.siteCode || '',
    directDispatch: '',
    salesmanName: '',
    remarks: '',
  });

  // Update form when userData or vehicle parameter changes
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        warehouseCode: userData.warehouseCode || '',
        warehouseName: userData.warehouseName || '',
        siteCode: userData.siteCode || '',
      }));
    }
    
    // Update vehicle number if passed from Gate Entry
    if (preFilledVehicleNo) {
      setFormData(prev => ({
        ...prev,
        vehicleNo: preFilledVehicleNo.toUpperCase()
      }));
    }
  }, [userData, preFilledVehicleNo]);

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ UPDATED: Validation - only vehicle number required
  const validateForm = () => {
    // Only vehicle number is mandatory
    if (!formData.vehicleNo?.trim()) {
      Alert.alert('Validation Error', 'Vehicle number is required');
      return false;
    }
    
    // All other fields are optional - no validation needed
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // ✅ UPDATED: Send all fields (backend will handle optional ones)
      const manualEntryData = {
        gate_type: 'Gate-In',
        vehicle_no: formData.vehicleNo,
        document_type: formData.documentType || null,        // Optional
        document_no: formData.documentNo || null,            // Optional
        document_date: formData.documentDate || null,
        customer_code: formData.customerCode || null,
        customer_name: formData.customerName || null,
        total_quantity: formData.totalQuantity || null,
        transporter_name: formData.transporterName || null,
        e_way_bill_no: formData.eWayBillNo || null,
        route_code: formData.routeCode || null,
        direct_dispatch: formData.directDispatch || null,
        salesman_name: formData.salesmanName || null,
        remarks: formData.remarks || null,
      };

      const response = await gateAPI.createManualGateEntry(manualEntryData);
      
      Alert.alert(
        'Success', 
        `Manual gate entry created successfully!\nGate Entry No: ${response.gate_entry_no}\nDocument No: ${response.document_no}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to security dashboard
              router.push('/security/');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Manual entry submission failed:', error);
      
      const errorMessage = handleAPIError(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Form',
      'Are you sure you want to clear all fields except vehicle number?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setFormData({
              vehicleNo: preFilledVehicleNo.toUpperCase(), // ✅ Keep vehicle number
              documentType: '',
              documentNo: '',
              documentDate: new Date().toISOString().split('T')[0],
              customerCode: '',
              customerName: '',
              warehouseCode: userData?.warehouseCode || '',
              warehouseName: userData?.warehouseName || '',
              totalQuantity: '',
              transporterName: '',
              eWayBillNo: '',
              routeCode: '',
              siteCode: userData?.siteCode || '',
              directDispatch: '',
              salesmanName: '',
              remarks: '',
            });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Card Container */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Manual Vehicle Entry Form</Text>
        
        {/* ✅ Vehicle Number - Fixed/Disabled and Mandatory */}
        <View style={styles.row}>
          <View style={styles.fieldFull}>
            <Text style={styles.label}>Vehicle Number * (From Gate Entry)</Text>
            <TextInput 
              style={[styles.input, styles.inputDisabled]} 
              value={formData.vehicleNo}
              editable={false} // ✅ Cannot be edited
              placeholder="Vehicle number from Gate Entry"
            />
            {!preFilledVehicleNo && (
              <Text style={styles.warningText}>
                ⚠️ Vehicle number should be provided from Gate Entry page
              </Text>
            )}
          </View>
        </View>

        {/* ✅ UPDATED: All other fields are now OPTIONAL */}
        
        {/* Row 1 */}
        <View style={styles.row}>
          <View style={styles.field50}>
            <Text style={styles.label}>Document Type</Text>
            <TextInput 
              style={styles.input} 
              value={formData.documentType}
              onChangeText={(text) => updateField('documentType', text)}
              placeholder="e.g., Invoice, Delivery Challan (Optional)"
            />
          </View>
          <View style={styles.field50}>
            <Text style={styles.label}>Document Number</Text>
            <TextInput 
              style={styles.input} 
              value={formData.documentNo}
              onChangeText={(text) => updateField('documentNo', text)}
              placeholder="Enter Document Number (Optional)"
            />
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <View style={styles.field50}>
            <Text style={styles.label}>Document Date</Text>
            <TextInput 
              style={styles.input} 
              value={formData.documentDate}
              onChangeText={(text) => updateField('documentDate', text)}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.field50}>
            <Text style={styles.label}>Customer Code</Text>
            <TextInput 
              style={styles.input} 
              value={formData.customerCode}
              onChangeText={(text) => updateField('customerCode', text)}
              placeholder="Enter Customer Code"
            />
          </View>
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <View style={styles.field50}>
            <Text style={styles.label}>Customer Name</Text>
            <TextInput 
              style={styles.input} 
              value={formData.customerName}
              onChangeText={(text) => updateField('customerName', text)}
              placeholder="Enter Customer Name"
            />
          </View>
          <View style={styles.field50}>
            <Text style={styles.label}>Warehouse Code</Text>
            <TextInput 
              style={[styles.input, styles.inputDisabled]} 
              value={formData.warehouseCode}
              editable={false}
              placeholder="Auto-filled from user"
            />
          </View>
        </View>

        {/* Row 4 */}
        <View style={styles.row}>
          <View style={styles.field50}>
            <Text style={styles.label}>Warehouse Name</Text>
            <TextInput 
              style={styles.input} 
              value={formData.warehouseName}
              onChangeText={(text) => updateField('warehouseName', text)}
              placeholder="Enter Warehouse Name"
            />
          </View>
          <View style={styles.field50}>
            <Text style={styles.label}>Total Quantity</Text>
            <TextInput 
              style={styles.input} 
              value={formData.totalQuantity}
              onChangeText={(text) => updateField('totalQuantity', text)}
              placeholder="Enter Total Quantity"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Row 5 */}
        <View style={styles.row}>
          <View style={styles.field50}>
            <Text style={styles.label}>Transporter Name</Text>
            <TextInput 
              style={styles.input} 
              value={formData.transporterName}
              onChangeText={(text) => updateField('transporterName', text)}
              placeholder="Enter Transporter Name"
            />
          </View>
          <View style={styles.field50}>
            <Text style={styles.label}>E-Way Bill Number</Text>
            <TextInput 
              style={styles.input} 
              value={formData.eWayBillNo}
              onChangeText={(text) => updateField('eWayBillNo', text)}
              placeholder="Enter E-Way Bill Number"
            />
          </View>
        </View>

        {/* Row 6 */}
        <View style={styles.row}>
          <View style={styles.field50}>
            <Text style={styles.label}>Route Code</Text>
            <TextInput 
              style={styles.input} 
              value={formData.routeCode}
              onChangeText={(text) => updateField('routeCode', text)}
              placeholder="Enter Route Code"
            />
          </View>
          <View style={styles.field50}>
            <Text style={styles.label}>Site Code</Text>
            <TextInput 
              style={[styles.input, styles.inputDisabled]} 
              value={formData.siteCode}
              editable={false}
              placeholder="Auto-filled from user"
            />
          </View>
        </View>

        {/* Row 7 */}
        <View style={styles.row}>
          <View style={styles.field50}>
            <Text style={styles.label}>Direct Dispatch</Text>
            <TextInput 
              style={styles.input} 
              value={formData.directDispatch}
              onChangeText={(text) => updateField('directDispatch', text)}
              placeholder="Yes/No"
            />
          </View>
          <View style={styles.field50}>
            <Text style={styles.label}>Salesman Name</Text>
            <TextInput 
              style={styles.input} 
              value={formData.salesmanName}
              onChangeText={(text) => updateField('salesmanName', text)}
              placeholder="Enter Salesman Name"
            />
          </View>
        </View>

        {/* Row 8 */}
        <View style={styles.row}>
          <View style={styles.fieldFull}>
            <Text style={styles.label}>Remarks</Text>
            <TextInput 
              style={styles.input} 
              value={formData.remarks}
              onChangeText={(text) => updateField('remarks', text)}
              placeholder="Enter any remarks"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.submitButton, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Entry</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={handleClear}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>Clear Form</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ManualEntryForm;