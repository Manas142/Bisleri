"""add surrogate primary key to mfabric tables

Revision ID: 87f5a97ce9bd
Revises: 6e5b54898a6b
Create Date: 2025-07-31 18:23:59.760326

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '87f5a97ce9bd'
down_revision: Union[str, None] = '6e5b54898a6b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### CORRECTED commands ###
    
    # Table 1: mfabric_deliverychallan_data
    op.drop_constraint('mfabric_deliverychallan_data_pkey', 'mfabric_deliverychallan_data', type_='primary')
    op.execute("ALTER TABLE mfabric_deliverychallan_data ADD COLUMN id SERIAL")
    op.create_primary_key('mfabric_deliverychallan_data_pkey', 'mfabric_deliverychallan_data', ['id'])
    op.alter_column('mfabric_deliverychallan_data', 'document_no',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)
    
    # Table 2: mfabric_invoice_data
    op.drop_constraint('mfabric_invoice_data_pkey', 'mfabric_invoice_data', type_='primary')
    op.add_column('mfabric_invoice_data', sa.Column('id', sa.Integer(), autoincrement=True, nullable=False))
    op.create_primary_key('mfabric_invoice_data_pkey', 'mfabric_invoice_data', ['id'])
    op.alter_column('mfabric_invoice_data', 'document_no',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)
    
    # Table 3: mfabric_transferorder_rgp_data
    op.drop_constraint('mfabric_transferorder_rgp_data_pkey', 'mfabric_transferorder_rgp_data', type_='primary')
    op.add_column('mfabric_transferorder_rgp_data', sa.Column('id', sa.Integer(), autoincrement=True, nullable=False))
    op.create_primary_key('mfabric_transferorder_rgp_data_pkey', 'mfabric_transferorder_rgp_data', ['id'])
    op.alter_column('mfabric_transferorder_rgp_data', 'document_no',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)
    
    # ### end corrected commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### CORRECTED downgrade commands ###
    
    # Reverse Table 3: mfabric_transferorder_rgp_data
    op.alter_column('mfabric_transferorder_rgp_data', 'document_no',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
    op.drop_constraint('mfabric_transferorder_rgp_data_pkey', 'mfabric_transferorder_rgp_data', type_='primary')
    op.drop_column('mfabric_transferorder_rgp_data', 'id')
    op.create_primary_key('mfabric_transferorder_rgp_data_pkey', 'mfabric_transferorder_rgp_data', ['document_no'])
    
    # Reverse Table 2: mfabric_invoice_data
    op.alter_column('mfabric_invoice_data', 'document_no',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
    op.drop_constraint('mfabric_invoice_data_pkey', 'mfabric_invoice_data', type_='primary')
    op.drop_column('mfabric_invoice_data', 'id')
    op.create_primary_key('mfabric_invoice_data_pkey', 'mfabric_invoice_data', ['document_no'])
    
    # Reverse Table 1: mfabric_deliverychallan_data
    op.alter_column('mfabric_deliverychallan_data', 'document_no',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
    op.drop_constraint('mfabric_deliverychallan_data_pkey', 'mfabric_deliverychallan_data', type_='primary')
    op.drop_column('mfabric_deliverychallan_data', 'id')
    op.create_primary_key('mfabric_deliverychallan_data_pkey', 'mfabric_deliverychallan_data', ['document_no'])
    
    # ### end corrected downgrade commands ###