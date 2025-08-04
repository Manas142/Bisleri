# app/routers/gate.py - COMPLETE ENHANCED VERSION WITH OPERATIONAL DATA
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas import GateEntryCreate, GateEntryResponse
from app.models import DocumentData, InsightsData, UsersMaster
from app.auth import get_current_user
from app.utils.helpers import generate_gate_entry_no_for_user, fetch_user_details
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(tags=["Gate Operations"])

# Enhanced schemas for operational data capture
class EnhancedGateEntryCreate(BaseModel):
    gate_type: str = "Gate-In"
    vehicle_no: str  # Mandatory
    document_nos: List[str] = []  # For batch entry
    remarks: Optional[str] = None
    
    # NEW: Optional operational data that can be captured during gate entry
    driver_name: Optional[str] = None
    km_reading: Optional[str] = None
    loader_names: Optional[str] = None

class EnhancedManualGateEntryCreate(BaseModel):
    gate_type: str = "Gate-In"
    vehicle_no: str  # Only this is mandatory
    document_type: Optional[str] = None
    document_no: Optional[str] = None
    document_date: Optional[str] = None
    customer_code: Optional[str] = None
    customer_name: Optional[str] = None
    total_quantity: Optional[str] = None
    transporter_name: Optional[str] = None
    e_way_bill_no: Optional[str] = None
    route_code: Optional[str] = None
    direct_dispatch: Optional[str] = None
    salesman_name: Optional[str] = None
    remarks: Optional[str] = None
    
    # NEW: Operational data fields
    driver_name: Optional[str] = None
    km_reading: Optional[str] = None
    loader_names: Optional[str] = None

# Schema for Manual Gate Entry
class ManualGateEntryCreate(BaseModel):
    gate_type: str = "Gate-In"
    vehicle_no: str  # Only this is mandatory
    document_type: Optional[str] = None
    document_no: Optional[str] = None
    document_date: Optional[str] = None
    customer_code: Optional[str] = None
    customer_name: Optional[str] = None
    total_quantity: Optional[str] = None
    transporter_name: Optional[str] = None
    e_way_bill_no: Optional[str] = None
    route_code: Optional[str] = None
    direct_dispatch: Optional[str] = None
    salesman_name: Optional[str] = None
    remarks: Optional[str] = None

# Schema for Batch Gate Entry
class BatchGateEntryCreate(BaseModel):
    gate_type: str = "Gate-In"
    vehicle_no: str
    document_nos: List[str]
    remarks: Optional[str] = None

@router.get("/search-recent-documents/{vehicle_no}")
def search_recent_documents(
    vehicle_no: str,
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Search documents within last 18 hours for a vehicle"""
    
    if not vehicle_no.strip():
        raise HTTPException(status_code=400, detail="Vehicle number cannot be empty")
    
    clean_vehicle_no = vehicle_no.strip().upper()
    
    try:
        query = text("""
            SELECT * FROM document_data
            WHERE vehicle_no = :vehicle_no
            AND document_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '18 hours'
            ORDER BY document_date DESC
        """)
        
        result = db.execute(query, {"vehicle_no": clean_vehicle_no})
        documents = result.fetchall()
        
        if not documents:
            raise HTTPException(
                status_code=404, 
                detail=f"No recent documents found for vehicle: {vehicle_no} (within last 18 hours)"
            )
        
        document_list = []
        for doc in documents:
            document_list.append({
                "document_no": doc.document_no,
                "document_type": doc.document_type,
                "sub_document_type": doc.sub_document_type,
                "document_date": doc.document_date.isoformat() if doc.document_date else None,
                "vehicle_no": doc.vehicle_no,
                "warehouse_name": doc.warehouse_name,
                "warehouse_code": doc.warehouse_code,
                "customer_name": doc.customer_name,
                "customer_code": doc.customer_code,
                "total_quantity": doc.total_quantity,
                "transporter_name": doc.transporter_name,
                "e_way_bill_no": doc.e_way_bill_no,
                "route_code": doc.route_code,
                "route_no": doc.route_no,
                "site": doc.site,
                "direct_dispatch": doc.direct_dispatch,
                "salesman": doc.salesman,
                "gate_entry_no": doc.gate_entry_no,
                "from_warehouse_code": doc.from_warehouse_code,
                "to_warehouse_code": doc.to_warehouse_code,
                "irn_no": doc.irn_no
            })
        
        return {
            "vehicle_no": clean_vehicle_no,
            "count": len(document_list),
            "search_time": datetime.now().isoformat(),
            "documents": document_list
        }
        
    except Exception as e:
        if "No recent documents found" in str(e):
            raise e
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Database error while searching documents: {str(e)}"
            )

@router.get("/vehicle-status/{vehicle_no}")
def get_vehicle_status(
    vehicle_no: str,
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Get current gate status of a vehicle"""
    
    clean_vehicle_no = vehicle_no.strip().upper()
    
    last_entry = db.query(InsightsData).filter(
        InsightsData.vehicle_no == clean_vehicle_no
    ).order_by(InsightsData.date.desc(), InsightsData.time.desc()).first()
    
    if not last_entry:
        return {
            "vehicle_no": clean_vehicle_no,
            "status": "no_history",
            "last_movement": None,
            "can_gate_in": True,
            "can_gate_out": False,
            "message": "No previous gate movements found"
        }
    
    can_gate_in = last_entry.movement_type == "Gate-Out"
    can_gate_out = last_entry.movement_type == "Gate-In"
    
    return {
        "vehicle_no": clean_vehicle_no,
        "status": "active",
        "last_movement": {
            "type": last_entry.movement_type,
            "date": last_entry.date.isoformat(),
            "time": last_entry.time.isoformat(),
            "gate_entry_no": last_entry.gate_entry_no
        },
        "can_gate_in": can_gate_in,
        "can_gate_out": can_gate_out,
        "message": f"Last movement: {last_entry.movement_type} on {last_entry.date}"
    }

@router.post("/enhanced-batch-gate-entry")
def create_enhanced_batch_gate_entry(
    entry: EnhancedGateEntryCreate,
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Enhanced batch gate entry with optional operational data capture"""
    
    try:
        if not entry.document_nos and not entry.vehicle_no:
            raise HTTPException(status_code=400, detail="Please provide vehicle number or select documents")
        
        vehicle_no = entry.vehicle_no.strip().upper()
        
        # Check GATE IN/OUT SEQUENCE VALIDATION
        last_entry = db.query(InsightsData).filter(
            InsightsData.vehicle_no == vehicle_no
        ).order_by(InsightsData.date.desc(), InsightsData.time.desc()).first()
        
        if last_entry:
            if last_entry.movement_type == entry.gate_type:
                if entry.gate_type == "Gate-In":
                    raise HTTPException(
                        status_code=400,
                        detail=f"Vehicle {vehicle_no} already has Gate-In on {last_entry.date}. Must do Gate-Out first."
                    )
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Vehicle {vehicle_no} already has Gate-Out on {last_entry.date}. Must do Gate-In first."
                    )
        
        # Generate gate entry number
        gate_entry_no = generate_gate_entry_no_for_user(current_user.username)
        
        if not gate_entry_no:
            user_details = fetch_user_details(current_user.username)
            if user_details and user_details.get('warehouse_code'):
                from app.utils.helpers import generate_gate_entry_number
                gate_entry_no = generate_gate_entry_number(user_details['warehouse_code'])
            
            if not gate_entry_no:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate gate entry number. Please check user warehouse assignment."
                )
        
        now = datetime.now()
        security_name = f"{current_user.first_name} {current_user.last_name}"
        security_username = current_user.username
        
        records_processed = 0
        processed_documents = []
        
        # NEW: Validate operational data if provided
        operational_data = {}
        if entry.driver_name and entry.driver_name.strip():
            if len(entry.driver_name.strip()) < 2:
                raise HTTPException(status_code=400, detail="Driver name must be at least 2 characters")
            operational_data['driver_name'] = entry.driver_name.strip()
        
        if entry.km_reading and entry.km_reading.strip():
            km_reading = entry.km_reading.strip()
            if not km_reading.isdigit() or len(km_reading) < 3 or len(km_reading) > 6:
                raise HTTPException(status_code=400, detail="KM reading must be 3-6 digits")
            operational_data['km_reading'] = km_reading
        
        if entry.loader_names and entry.loader_names.strip():
            loader_names = entry.loader_names.strip()
            # Validate loader names (comma-separated)
            names = [name.strip() for name in loader_names.split(',') if name.strip()]
            if len(names) > 10:
                raise HTTPException(status_code=400, detail="Maximum 10 loader names allowed")
            operational_data['loader_names'] = ', '.join(names)
        
        # Process documents if provided
        if entry.document_nos:
            for document_no in entry.document_nos:
                try:
                    document = db.query(DocumentData).filter(
                        DocumentData.document_no == document_no
                    ).first()
                    
                    if not document:
                        print(f"Document {document_no} not found, skipping...")
                        continue
                    
                    # UPDATE document_data with gate_entry_no
                    document.gate_entry_no = gate_entry_no
                    
                    # CREATE insights_data entry with operational data
                    insight_record = InsightsData(
                        gate_entry_no=gate_entry_no,
                        document_type=document.document_type or "",
                        sub_document_type=document.sub_document_type or "",
                        vehicle_no=document.vehicle_no or vehicle_no,
                        warehouse_name=document.warehouse_name or current_user.warehouse_code,
                        date=now.date(),
                        time=now.time(),
                        movement_type=entry.gate_type,
                        remarks=entry.remarks or f"Gate entry for {document_no}",
                        warehouse_code=current_user.warehouse_code,
                        site_code=current_user.site_code,
                        security_name=security_name,
                        security_username=security_username,
                        document_date=document.document_date,
                        # NEW: Include operational data if provided
                        driver_name=operational_data.get('driver_name'),
                        km_reading=operational_data.get('km_reading'),
                        loader_names=operational_data.get('loader_names'),
                        edit_count=0,
                        last_edited_at=now if operational_data else None
                    )
                    
                    db.add(insight_record)
                    records_processed += 1
                    
                    processed_documents.append({
                        "document_no": document.document_no,
                        "document_type": document.document_type,
                        "vehicle_no": document.vehicle_no,
                        "status": "success"
                    })
                    
                except Exception as doc_error:
                    print(f"Error processing document {document_no}: {str(doc_error)}")
                    processed_documents.append({
                        "document_no": document_no,
                        "status": "error",
                        "error": str(doc_error)
                    })
                    continue
        else:
            # No documents - create single insights entry for empty vehicle
            insight_record = InsightsData(
                gate_entry_no=gate_entry_no,
                document_type="Empty Vehicle",
                sub_document_type="No Documents",
                vehicle_no=vehicle_no,
                warehouse_name=getattr(current_user, 'warehouse_name', f"Warehouse-{current_user.warehouse_code}"),
                date=now.date(),
                time=now.time(),
                movement_type=entry.gate_type,
                remarks=entry.remarks or f"Empty vehicle {entry.gate_type}",
                warehouse_code=current_user.warehouse_code,
                site_code=current_user.site_code,
                security_name=security_name,
                security_username=security_username,
                # NEW: Include operational data if provided
                driver_name=operational_data.get('driver_name'),
                km_reading=operational_data.get('km_reading'),
                loader_names=operational_data.get('loader_names'),
                edit_count=0,
                last_edited_at=now if operational_data else None
            )
            
            db.add(insight_record)
            records_processed = 1
        
        if records_processed > 0:
            db.commit()
            
            # NEW: Calculate operational completeness
            has_operational_data = bool(operational_data)
            operational_complete = all([
                operational_data.get('driver_name'),
                operational_data.get('km_reading'), 
                operational_data.get('loader_names')
            ])
            
            return {
                "message": f"Successfully processed {records_processed} records",
                "gate_entry_no": gate_entry_no,
                "records_processed": records_processed,
                "total_requested": len(entry.document_nos) if entry.document_nos else 1,
                "processed_documents": processed_documents,
                "date": now.isoformat(),
                "vehicle_no": vehicle_no,
                "movement_type": entry.gate_type,
                # NEW: Operational data status
                "operational_data_captured": has_operational_data,
                "operational_complete": operational_complete,
                "missing_operational_fields": [
                    field for field in ['driver_name', 'km_reading', 'loader_names']
                    if not operational_data.get(field)
                ],
                "edit_window_expires": (now + timedelta(hours=24)).isoformat()
            }
        else:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail="No documents were processed successfully"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Enhanced batch gate entry error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

@router.post("/batch-gate-entry")
def create_batch_gate_entry(
    entry: BatchGateEntryCreate,
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Batch gate entry with RAW SQL gate entry number generation"""
    
    try:
        if not entry.document_nos:
            raise HTTPException(status_code=400, detail="Please select at least one document")
        
        vehicle_no = entry.vehicle_no.strip().upper()
        
        # Check GATE IN/OUT SEQUENCE VALIDATION
        last_entry = db.query(InsightsData).filter(
            InsightsData.vehicle_no == vehicle_no
        ).order_by(InsightsData.date.desc(), InsightsData.time.desc()).first()
        
        if last_entry:
            if last_entry.movement_type == entry.gate_type:
                if entry.gate_type == "Gate-In":
                    raise HTTPException(
                        status_code=400,
                        detail=f"Vehicle {vehicle_no} already has Gate-In on {last_entry.date}. Must do Gate-Out first."
                    )
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Vehicle {vehicle_no} already has Gate-Out on {last_entry.date}. Must do Gate-In first."
                    )
        
        # RAW SQL: Generate gate entry number using fresh database data
        gate_entry_no = generate_gate_entry_no_for_user(current_user.username)
        
        if not gate_entry_no:
            # Fallback: Get fresh user details and try again
            user_details = fetch_user_details(current_user.username)
            if user_details and user_details.get('warehouse_code'):
                from app.utils.helpers import generate_gate_entry_number
                gate_entry_no = generate_gate_entry_number(user_details['warehouse_code'])
            
            if not gate_entry_no:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate gate entry number. Please check user warehouse assignment."
                )
        
        now = datetime.now()
        
        # Get user details for security logging
        security_name = f"{current_user.first_name} {current_user.last_name}"
        security_username = current_user.username
        
        records_processed = 0
        processed_documents = []
        
        # Process each selected document
        for document_no in entry.document_nos:
            try:
                document = db.query(DocumentData).filter(
                    DocumentData.document_no == document_no
                ).first()
                
                if not document:
                    print(f"Document {document_no} not found, skipping...")
                    continue
                
                # UPDATE document_data with gate_entry_no
                document.gate_entry_no = gate_entry_no
                
                # CREATE insights_data entry
                insight_record = InsightsData(
                    gate_entry_no=gate_entry_no,
                    document_type=document.document_type or "",
                    sub_document_type=document.sub_document_type or "",
                    vehicle_no=document.vehicle_no or vehicle_no,
                    warehouse_name=document.warehouse_name or current_user.warehouse_code,
                    date=now.date(),
                    time=now.time(),
                    movement_type=entry.gate_type,
                    remarks=entry.remarks or f"Gate entry for {document_no}",
                    warehouse_code=current_user.warehouse_code,
                    site_code=current_user.site_code,
                    security_name=security_name,
                    security_username=security_username,
                    document_date=document.document_date,
                    edit_count=0
                )
                
                db.add(insight_record)
                records_processed += 1
                
                processed_documents.append({
                    "document_no": document.document_no,
                    "document_type": document.document_type,
                    "vehicle_no": document.vehicle_no,
                    "status": "success"
                })
                
            except Exception as doc_error:
                print(f"Error processing document {document_no}: {str(doc_error)}")
                processed_documents.append({
                    "document_no": document_no,
                    "status": "error",
                    "error": str(doc_error)
                })
                continue
        
        if records_processed > 0:
            db.commit()
            
            return {
                "message": f"Successfully processed {records_processed} records",
                "gate_entry_no": gate_entry_no,
                "records_processed": records_processed,
                "total_requested": len(entry.document_nos),
                "processed_documents": processed_documents,
                "date": now.isoformat(),
                "vehicle_no": vehicle_no,
                "movement_type": entry.gate_type
            }
        else:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail="No documents were processed successfully"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Batch gate entry error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

@router.post("/enhanced-manual-gate-entry", response_model=GateEntryResponse)
def create_enhanced_manual_gate_entry(
    entry: EnhancedManualGateEntryCreate,
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Enhanced manual gate entry with operational data capture"""
    
    try:
        if not entry.vehicle_no.strip():
            raise HTTPException(status_code=400, detail="Vehicle number is required")
        
        vehicle_no = entry.vehicle_no.strip().upper()
        
        # Check GATE IN/OUT SEQUENCE VALIDATION
        last_entry = db.query(InsightsData).filter(
            InsightsData.vehicle_no == vehicle_no
        ).order_by(InsightsData.date.desc(), InsightsData.time.desc()).first()
        
        if last_entry:
            if last_entry.movement_type == entry.gate_type:
                if entry.gate_type == "Gate-In":
                    raise HTTPException(
                        status_code=400,
                        detail=f"Vehicle {vehicle_no} already has Gate-In. Must do Gate-Out first."
                    )
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Vehicle {vehicle_no} already has Gate-Out. Must do Gate-In first."
                    )
        
        # Generate gate entry number
        gate_entry_no = generate_gate_entry_no_for_user(current_user.username)
        
        if not gate_entry_no:
            user_details = fetch_user_details(current_user.username)
            if user_details and user_details.get('warehouse_code'):
                from app.utils.helpers import generate_gate_entry_number
                gate_entry_no = generate_gate_entry_number(user_details['warehouse_code'])
            
            if not gate_entry_no:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate gate entry number. Please check user warehouse assignment."
                )
        
        now = datetime.now()
        warehouse_name = getattr(current_user, 'warehouse_name', f"Warehouse-{current_user.warehouse_code}")
        
        # NEW: Process operational data
        operational_data = {}
        if entry.driver_name and entry.driver_name.strip():
            operational_data['driver_name'] = entry.driver_name.strip()
        
        if entry.km_reading and entry.km_reading.strip():
            km_reading = entry.km_reading.strip()
            if km_reading.isdigit() and 3 <= len(km_reading) <= 6:
                operational_data['km_reading'] = km_reading
        
        if entry.loader_names and entry.loader_names.strip():
            operational_data['loader_names'] = entry.loader_names.strip()
        
        # CREATE insights_data entry with operational data
        insight_record = InsightsData(
            gate_entry_no=gate_entry_no,
            document_type=entry.document_type or "Manual Entry",
            sub_document_type="Manual Entry",
            vehicle_no=vehicle_no,
            warehouse_name=warehouse_name,
            date=now.date(),
            time=now.time(),
            movement_type=entry.gate_type,
            remarks=entry.remarks or f"Manual {entry.gate_type} for {vehicle_no}",
            warehouse_code=current_user.warehouse_code,
            site_code=current_user.site_code,
            security_name=f"{current_user.first_name} {current_user.last_name}",
            security_username=current_user.username,
            # NEW: Include operational data
            driver_name=operational_data.get('driver_name'),
            km_reading=operational_data.get('km_reading'),
            loader_names=operational_data.get('loader_names'),
            edit_count=0,
            last_edited_at=now if operational_data else None
        )
        
        db.add(insight_record)
        db.commit()
        
        return GateEntryResponse(
            gate_entry_no=gate_entry_no,
            date=now,
            time=now,
            vehicle_no=vehicle_no,
            document_no=f"MANUAL-{gate_entry_no}",
            warehouse_name=warehouse_name,
            movement_type=entry.gate_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Enhanced manual entry error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

@router.post("/manual-gate-entry", response_model=GateEntryResponse)
def create_manual_gate_entry(
    entry: ManualGateEntryCreate,
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Manual gate entry with RAW SQL gate entry number generation"""
    
    try:
        if not entry.vehicle_no.strip():
            raise HTTPException(status_code=400, detail="Vehicle number is required")
        
        vehicle_no = entry.vehicle_no.strip().upper()
        
        # Check GATE IN/OUT SEQUENCE VALIDATION
        last_entry = db.query(InsightsData).filter(
            InsightsData.vehicle_no == vehicle_no
        ).order_by(InsightsData.date.desc(), InsightsData.time.desc()).first()
        
        if last_entry:
            if last_entry.movement_type == entry.gate_type:
                if entry.gate_type == "Gate-In":
                    raise HTTPException(
                        status_code=400,
                        detail=f"Vehicle {vehicle_no} already has Gate-In. Must do Gate-Out first."
                    )
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Vehicle {vehicle_no} already has Gate-Out. Must do Gate-In first."
                    )
        
        # RAW SQL: Generate gate entry number using fresh database data
        gate_entry_no = generate_gate_entry_no_for_user(current_user.username)
        
        if not gate_entry_no:
            # Fallback: Get fresh user details and try again
            user_details = fetch_user_details(current_user.username)
            if user_details and user_details.get('warehouse_code'):
                from app.utils.helpers import generate_gate_entry_number
                gate_entry_no = generate_gate_entry_number(user_details['warehouse_code'])
            
            if not gate_entry_no:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate gate entry number. Please check user warehouse assignment."
                )
        
        now = datetime.now()
        
        # Get warehouse name safely
        warehouse_name = getattr(current_user, 'warehouse_name', f"Warehouse-{current_user.warehouse_code}")
        
        # ONLY CREATE insights_data entry
        insight_record = InsightsData(
            gate_entry_no=gate_entry_no,
            document_type=entry.document_type or "Manual Entry",
            sub_document_type="Manual Entry",
            vehicle_no=vehicle_no,
            warehouse_name=warehouse_name,
            date=now.date(),
            time=now.time(),
            movement_type=entry.gate_type,
            remarks=entry.remarks or f"Manual {entry.gate_type} for {vehicle_no}",
            warehouse_code=current_user.warehouse_code,
            site_code=current_user.site_code,
            security_name=f"{current_user.first_name} {current_user.last_name}",
            security_username=current_user.username,
            edit_count=0
        )
        
        db.add(insight_record)
        db.commit()
        
        return GateEntryResponse(
            gate_entry_no=gate_entry_no,
            date=now,
            time=now,
            vehicle_no=vehicle_no,
            document_no=f"MANUAL-{gate_entry_no}",
            warehouse_name=warehouse_name,
            movement_type=entry.gate_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Manual entry error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

@router.get("/documents/{vehicle_no}")
def get_documents_by_vehicle(
    vehicle_no: str,
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Enhanced document search by vehicle number"""
    
    if not vehicle_no.strip():
        raise HTTPException(status_code=400, detail="Vehicle number cannot be empty")
    
    clean_vehicle_no = vehicle_no.strip().upper()
    
    documents = db.query(DocumentData).filter(
        DocumentData.vehicle_no.ilike(f"%{clean_vehicle_no}%")
    ).all()
    
    if not documents:
        raise HTTPException(
            status_code=404, 
            detail=f"No documents found for vehicle: {vehicle_no}"
        )
    
    return [
        {
            "document_no": doc.document_no,
            "document_type": doc.document_type,
            "sub_document_type": doc.sub_document_type,
            "document_date": doc.document_date,
            "vehicle_no": doc.vehicle_no,
            "warehouse_name": doc.warehouse_name,
            "warehouse_code": doc.warehouse_code,
            "customer_name": doc.customer_name,
            "customer_code": doc.customer_code,
            "total_quantity": doc.total_quantity,
            "transporter_name": doc.transporter_name,
            "e_way_bill_no": doc.e_way_bill_no,
            "route_code": doc.route_code,
            "site": doc.site,
            "direct_dispatch": doc.direct_dispatch,
            "salesman": doc.salesman,
            "gate_entry_no": doc.gate_entry_no
        }
        for doc in documents
    ]

@router.get("/vehicle-history/{vehicle_no}")
def get_vehicle_history(
    vehicle_no: str,
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Get complete movement history for a vehicle"""
    
    clean_vehicle_no = vehicle_no.strip().upper()
    
    movements = db.query(InsightsData).filter(
        InsightsData.vehicle_no.ilike(f"%{clean_vehicle_no}%")
    ).order_by(InsightsData.date.desc(), InsightsData.time.desc()).all()
    
    if not movements:
        raise HTTPException(
            status_code=404,
            detail=f"No movement history found for vehicle: {vehicle_no}"
        )
    
    return {
        "vehicle_no": clean_vehicle_no,
        "total_movements": len(movements),
        "history": [
            {
                "gate_entry_no": move.gate_entry_no,
                "date": move.date,
                "time": move.time,
                "movement_type": move.movement_type,
                "warehouse_name": move.warehouse_name,
                "document_type": move.document_type,
                "security_name": move.security_name,
                "remarks": move.remarks,
                # NEW: Include operational data in history
                "driver_name": move.driver_name,
                "km_reading": move.km_reading,
                "loader_names": move.loader_names,
                "edit_count": move.edit_count or 0
            }
            for move in movements
        ]
    }

@router.get("/operational-summary")
def get_operational_data_summary(
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Get summary of operational data completion rates"""
    try:
        # Base query with warehouse filter
        base_query = db.query(InsightsData)
        if current_user.role != "Admin":
            base_query = base_query.filter(
                InsightsData.warehouse_code == current_user.warehouse_code
            )
        
        # Get records from last 7 days
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_records = base_query.filter(
            InsightsData.date >= seven_days_ago.date()
        ).all()
        
        if not recent_records:
            return {
                "total_records": 0,
                "completion_stats": {},
                "recommendations": []
            }
        
        # Calculate completion statistics
        total_records = len(recent_records)
        complete_operational = 0
        missing_driver = 0
        missing_km = 0
        missing_loaders = 0
        multiple_edits = 0
        
        for record in recent_records:
            # Check operational completeness
            if (record.driver_name and record.driver_name.strip() and
                record.km_reading and record.km_reading.strip() and
                record.loader_names and record.loader_names.strip()):
                complete_operational += 1
            
            # Count missing fields
            if not (record.driver_name and record.driver_name.strip()):
                missing_driver += 1
            if not (record.km_reading and record.km_reading.strip()):
                missing_km += 1
            if not (record.loader_names and record.loader_names.strip()):
                missing_loaders += 1
            
            # Count records with multiple edits
            if (record.edit_count or 0) > 1:
                multiple_edits += 1
        
        completion_percentage = (complete_operational / total_records * 100) if total_records > 0 else 0
        
        # Generate recommendations
        recommendations = []
        if completion_percentage < 50:
            recommendations.append("Consider capturing operational data during initial gate entry")
        if missing_driver > total_records * 0.3:
            recommendations.append("Focus on capturing driver names during vehicle entry")
        if missing_km > total_records * 0.4:
            recommendations.append("Emphasize KM reading collection for journey tracking")
        if missing_loaders > total_records * 0.5:
            recommendations.append("Improve loader name documentation for operational efficiency")
        
        return {
            "total_records": total_records,
            "completion_stats": {
                "complete_operational": complete_operational,
                "completion_percentage": round(completion_percentage, 1),
                "missing_driver": missing_driver,
                "missing_km": missing_km,
                "missing_loaders": missing_loaders,
                "multiple_edits": multiple_edits
            },
            "recommendations": recommendations,
            "period": "Last 7 days"
        }
        
    except Exception as e:
        print(f"Error getting operational summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summary error: {str(e)}")
    

# Sync routes below

# ADD THESE ENDPOINTS TO YOUR EXISTING app/routers/gate.py

@router.get("/available-documents/{vehicle_no}")
def get_available_documents(
    vehicle_no: str,
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Get available documents for vehicle from last 1 hour without gate_entry_no"""
    
    if not vehicle_no.strip():
        raise HTTPException(status_code=400, detail="Vehicle number cannot be empty")
    
    clean_vehicle_no = vehicle_no.strip().upper()
    
    try:
        query = text("""
            SELECT document_no, document_type, document_date, 
                   customer_name, total_quantity, transporter_name,
                   e_way_bill_no, route_code
            FROM document_data
            WHERE vehicle_no = :vehicle_no
            AND (gate_entry_no IS NULL OR gate_entry_no = '')
            AND document_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '1 hour'
            ORDER BY document_date DESC
        """)
        
        result = db.execute(query, {"vehicle_no": clean_vehicle_no})
        documents = result.fetchall()
        
        document_list = []
        for doc in documents:
            document_list.append({
                "document_no": doc.document_no,
                "document_type": doc.document_type,
                "document_date": doc.document_date.isoformat() if doc.document_date else None,
                "customer_name": doc.customer_name,
                "total_quantity": doc.total_quantity,
                "transporter_name": doc.transporter_name,
                "e_way_bill_no": doc.e_way_bill_no,
                "route_code": doc.route_code
            })
        
        return {
            "vehicle_no": clean_vehicle_no,
            "count": len(document_list),
            "documents": document_list,
            "search_window": "Last 1 hour",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/assign-document")
def assign_document_to_manual_entry(
    assignment: dict,  # {insights_record_id: int, document_no: str}
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Assign document to manual entry row"""
    
    try:
        insights_record = db.query(InsightsData).filter(
            InsightsData.id == assignment["insights_record_id"]
        ).first()
        
        if not insights_record:
            raise HTTPException(status_code=404, detail="Manual entry record not found")
        
        # Check 12-hour assignment window
        entry_datetime = datetime.combine(insights_record.date, insights_record.time)
        time_elapsed = datetime.now() - entry_datetime
        
        if time_elapsed.total_seconds() > 12 * 60 * 60:
            raise HTTPException(
                status_code=403, 
                detail="Assignment window expired. Documents can only be assigned within 12 hours."
            )
        
        # Check if already assigned
        if insights_record.document_type and insights_record.document_type != "Manual Entry":
            raise HTTPException(status_code=400, detail="This manual entry already has a document assigned")
        
        # Get document
        document = db.query(DocumentData).filter(
            DocumentData.document_no == assignment["document_no"]
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Check if document already assigned
        if document.gate_entry_no and document.gate_entry_no.strip():
            raise HTTPException(
                status_code=400, 
                detail=f"Document {assignment['document_no']} is already assigned to gate entry {document.gate_entry_no}"
            )
        
        # Verify vehicle numbers match
        if document.vehicle_no.upper() != insights_record.vehicle_no.upper():
            raise HTTPException(
                status_code=400, 
                detail="Vehicle number mismatch. Please verify vehicle details"
            )
        
        # Update insights_data
        insights_record.document_type = document.document_type
        insights_record.sub_document_type = document.sub_document_type
        insights_record.document_date = document.document_date
        insights_record.last_edited_at = datetime.now()
        insights_record.edit_count = (insights_record.edit_count or 0) + 1
        
        # Update document_data
        document.gate_entry_no = insights_record.gate_entry_no
        
        db.commit()
        
        return {
            "message": "Document assigned successfully",
            "insights_record_id": assignment["insights_record_id"],
            "document_no": assignment["document_no"],
            "gate_entry_no": insights_record.gate_entry_no,
            "assigned_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Assignment failed: {str(e)}")

@router.post("/multiple-manual-entry")
def create_multiple_manual_entries(
    entry: dict,  # {gate_type, vehicle_no, number_of_documents, driver_name, km_reading, loader_names, remarks}
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Create multiple manual entries - NO DOCUMENT LIMIT"""
    
    try:
        if not entry["vehicle_no"].strip():
            raise HTTPException(status_code=400, detail="Vehicle number is required")
        
        # ✅ REMOVED: Document count limit check
        if entry["number_of_documents"] < 1:
            raise HTTPException(status_code=400, detail="Number of documents must be at least 1")
        
        vehicle_no = entry["vehicle_no"].strip().upper()
        
        # Gate sequence validation
        last_entry = db.query(InsightsData).filter(
            InsightsData.vehicle_no == vehicle_no
        ).order_by(InsightsData.date.desc(), InsightsData.time.desc()).first()
        
        if last_entry and last_entry.movement_type == entry["gate_type"]:
            movement_type = "Gate-In" if entry["gate_type"] == "Gate-In" else "Gate-Out"
            raise HTTPException(
                status_code=400,
                detail=f"Vehicle {vehicle_no} already has {movement_type}. Must do opposite movement first."
            )
        
        # Generate gate entry number
        gate_entry_no = generate_gate_entry_no_for_user(current_user.username)
        if not gate_entry_no:
            raise HTTPException(status_code=500, detail="Failed to generate gate entry number")
        
        now = datetime.now()
        warehouse_name = getattr(current_user, 'warehouse_name', f"Warehouse-{current_user.warehouse_code}")
        
        # Create multiple entries
        for i in range(entry["number_of_documents"]):
            insight_record = InsightsData(
                gate_entry_no=gate_entry_no,
                document_type="Manual Entry",
                sub_document_type="Pending Assignment",
                vehicle_no=vehicle_no,
                warehouse_name=warehouse_name,
                date=now.date(),
                time=now.time(),
                movement_type=entry["gate_type"],
                remarks=entry.get("remarks") or f"Manual {entry['gate_type']} - Document {i+1}/{entry['number_of_documents']}",
                warehouse_code=current_user.warehouse_code,
                site_code=current_user.site_code,
                security_name=f"{current_user.first_name} {current_user.last_name}",
                security_username=current_user.username,
                document_date=now,
                driver_name=entry.get("driver_name"),
                km_reading=entry.get("km_reading"),
                loader_names=entry.get("loader_names"),
                edit_count=0,
                last_edited_at=now if any([entry.get("driver_name"), entry.get("km_reading"), entry.get("loader_names")]) else None
            )
            db.add(insight_record)
        
        db.commit()
        
        return {
            "message": f"Successfully created {entry['number_of_documents']} manual entries",
            "gate_entry_no": gate_entry_no,
            "records_created": entry["number_of_documents"],
            "vehicle_no": vehicle_no,
            "movement_type": entry["gate_type"],
            "assignment_expires_at": (now + timedelta(hours=12)).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/unassigned-count")
def get_unassigned_documents_count(
    db: Session = Depends(get_db),
    current_user: UsersMaster = Depends(get_current_user)
):
    """Get count of manual entries needing document assignment"""
    try:
        base_query = db.query(InsightsData)
        
        # Filter by warehouse for non-admins
        if current_user.role != "Admin":
            base_query = base_query.filter(InsightsData.warehouse_code == current_user.warehouse_code)
        
        # Count pending assignments within 12 hours
        twelve_hours_ago = datetime.now() - timedelta(hours=12)
        count = base_query.filter(
            InsightsData.date >= twelve_hours_ago.date(),
            InsightsData.document_type == "Manual Entry",
            InsightsData.sub_document_type == "Pending Assignment"
        ).count()
        
        return {"unassigned_count": count}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Count error: {str(e)}")