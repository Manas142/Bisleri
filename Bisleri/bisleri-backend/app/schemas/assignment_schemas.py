# app/schemas/assignment_schemas.py - NEW FILE
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List

class MultipleManualEntryCreate(BaseModel):
    gate_type: str = "Gate-In"
    vehicle_no: str
    number_of_documents: int  # NO UPPER LIMIT
    remarks: Optional[str] = None
    driver_name: Optional[str] = None
    km_reading: Optional[str] = None
    loader_names: Optional[str] = None
    
    @validator('number_of_documents')
    def validate_number_of_documents(cls, v):
        if v < 1:
            raise ValueError('Number of documents must be at least 1')
        # ✅ REMOVED: Upper limit check
        return v
    
    @validator('vehicle_no')
    def validate_vehicle_no(cls, v):
        if not v or not v.strip():
            raise ValueError('Vehicle number is required')
        return v.strip().upper()

class DocumentAssignmentRequest(BaseModel):
    insights_record_id: int
    document_no: str
    
    @validator('insights_record_id')
    def validate_record_id(cls, v):
        if v <= 0:
            raise ValueError('Invalid record ID')
        return v
    
    @validator('document_no')
    def validate_document_no(cls, v):
        if not v or not v.strip():
            raise ValueError('Document number is required')
        return v.strip()