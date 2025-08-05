// app/security/manual-entry/ManualEntryForm.js - NO DOCUMENT LIMIT
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
  
  const preFilledVehicleNo = searchParams.vehicle || '';
  const preFilledGateType = searchParams.gateType || 'Gate-In';
  
  const [formData, setFormData] = useState({
    gateType: preFilledGateType,
    vehicleNo: preFilledVehicleNo.toUpperCase(),
    numberOfDocuments: '', // ✅ NO DEFAULT, NO LIMIT
    driverName: '',
    kmReading: '',
    loaderNames: '',
    remarks: '',
  });

  useEffect(() => {
    if (preFilledVehicleNo) {
      setFormData(prev => ({
        ...prev,
        vehicleNo: preFilledVehicleNo.toUpperCase(),
        gateType: preFilledGateType
      }));
    }
  }, [preFilledVehicleNo, preFilledGateType]);

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.vehicleNo.trim()) {
      Alert.alert('Validation Error', 'Vehicle number is required');
      return false;
    }
    
    if (!formData.numberOfDocuments || parseInt(formData.numberOfDocuments) < 1) {
      Alert.alert('Validation Error', 'Please enter number of documents (minimum 1)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const apiData = {
        gate_type: formData.gateType,
        vehicle_no: formData.vehicleNo.trim(),
        number_of_documents: parseInt(formData.numberOfDocuments),
        remarks: formData.remarks?.trim() || null,
        driver_name: formData.driverName?.trim() || null,
        km_reading: formData.kmReading?.trim() || null,
        loader_names: formData.loaderNames?.trim() || null
      };
      
      const response = await gateAPI.post('/multiple-manual-entry', apiData);
      
      Alert.alert(
        'Success', 
        `Successfully created ${response.records_created} manual entries!\nGate Entry No: ${response.gate_entry_no}\nVehicle: ${response.vehicle_no}\n\nNext: Go to Insights tab to assign documents within 12 hours`,
        [
          {
            text: 'Go to Insights',
            onPress: () => router.push('/security/?tab=insights')
          },
          {
            text: 'Create Another',
            onPress: () => {
              setFormData({
                gateType: 'Gate-In',
                vehicleNo: '',
                numberOfDocuments: '',
                driverName: '',
                kmReading: '',
                loaderNames: '',
                remarks: '',
              });
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

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Manual Vehicle Entry</Text>
        
        {/* Gate Type */}
        <View style={styles.row}>
          <View style={styles.fieldFull}>
            <Text style={styles.label}>Gate Type *</Text>
            <View style={styles.radioContainer}>
              {['Gate-In', 'Gate-Out'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.radioButton}
                  onPress={() => updateField('gateType', type)}
                  disabled={isSubmitting}
                >
                  <View style={styles.radioCircle}>
                    {formData.gateType === type && <View style={styles.selectedDot} />}
                  </View>
                  <Text style={styles.radioText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Vehicle Number */}
        <View style={styles.row}>
          <View style={styles.fieldFull}>
            <Text style={styles.label}>Vehicle Number *</Text>
            <TextInput 
              style={[styles.input, preFilledVehicleNo ? styles.inputDisabled : styles.inputRequired]} 
              value={formData.vehicleNo}
              onChangeText={(text) => updateField('vehicleNo', text.toUpperCase())}
              editable={!preFilledVehicleNo && !isSubmitting}
              placeholder={preFilledVehicleNo ? "Pre-filled from Gate Entry" : "Enter vehicle number"}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Number of Documents - NO LIMIT */}
        <View style={styles.row}>
          <View style={styles.field50}>
            <Text style={styles.label}>Number of Documents *</Text>
            <TextInput 
              style={[styles.input, styles.inputRequired]} 
              value={formData.numberOfDocuments}
              onChangeText={(text) => {
                // ✅ ALLOW ANY POSITIVE NUMBER
                if (text === '' || /^\d+$/.test(text)) {
                  updateField('numberOfDocuments', text);
                }
              }}
              keyboardType="numeric"
              placeholder="Enter number (no limit)"
              editable={!isSubmitting}
            />
          </View>
          
          <View style={styles.field50}>
            <Text style={styles.label}>Assignment Window</Text>
            <TextInput 
              style={[styles.input, styles.inputDisabled]} 
              value="12 Hours"
              editable={false}
            />
          </View>
        </View>

        {/* Operational Fields */}
        <View style={styles.row}>
          <View style={styles.field50}>
            <Text style={styles.label}>Driver Name (Optional)</Text>
            <TextInput 
              style={styles.input} 
              value={formData.driverName}
              onChangeText={(text) => updateField('driverName', text)}
              placeholder="Enter driver's name"
              editable={!isSubmitting}
            />
          </View>
          
          <View style={styles.field50}>
            <Text style={styles.label}>KM Reading (Optional)</Text>
            <TextInput 
              style={styles.input} 
              value={formData.kmReading}
              onChangeText={(text) => updateField('kmReading', text.replace(/[^0-9]/g, ''))}
              placeholder="Enter KM reading"
              keyboardType="numeric"
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* Loader Names */}
        <View style={styles.row}>
          <View style={styles.fieldFull}>
            <Text style={styles.label}>Loader Names (Optional)</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={formData.loaderNames}
              onChangeText={(text) => updateField('loaderNames', text)}
              placeholder="Enter loader names (comma-separated)"
              multiline
              numberOfLines={2}
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* Remarks */}
        <View style={styles.row}>
          <View style={styles.fieldFull}>
            <Text style={styles.label}>Remarks (Optional)</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={formData.remarks}
              onChangeText={(text) => updateField('remarks', text)}
              placeholder="Enter any remarks"
              multiline
              numberOfLines={3}
              editable={!isSubmitting}
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
              <Text style={styles.buttonText}>
                Create {formData.numberOfDocuments || '?'} Manual Entries
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={() => {
              setFormData({
                gateType: 'Gate-In',
                vehicleNo: '',
                numberOfDocuments: '',
                driverName: '',
                kmReading: '',
                loaderNames: '',
                remarks: '',
              });
            }}
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