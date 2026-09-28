"""Initial schema with all 13 tables and pgvector extension

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-28 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

try:
    from pgvector.sqlalchemy import Vector
    PG_VECTOR = True
except ImportError:
    PG_VECTOR = False

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension if on PostgreSQL
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='patient'),
        sa.Column('preferred_language', sa.String(length=10), nullable=False, server_default='en'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_phone', 'users', ['phone'], unique=True)

    # 2. patients
    op.create_table(
        'patients',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('display_name', sa.String(length=100), nullable=False),
        sa.Column('preferred_language', sa.String(length=10), nullable=False, server_default='en'),
        sa.Column('phone_for_ivr', sa.String(length=20), nullable=False),
        sa.Column('phone_type', sa.String(length=20), nullable=False, server_default='smartphone'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_patients_user_id', 'patients', ['user_id'])
    op.create_index('ix_patients_phone_for_ivr', 'patients', ['phone_for_ivr'])

    # 3. caregiver_links
    op.create_table(
        'caregiver_links',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('caregiver_id', sa.String(length=36), nullable=False),
        sa.Column('patient_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['caregiver_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_caregiver_links_caregiver_id', 'caregiver_links', ['caregiver_id'])
    op.create_index('ix_caregiver_links_patient_id', 'caregiver_links', ['patient_id'])

    # 4. reports
    op.create_table(
        'reports',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('patient_id', sa.String(length=36), nullable=False),
        sa.Column('uploaded_by', sa.String(length=36), nullable=True),
        sa.Column('source', sa.String(length=20), nullable=False, server_default='app'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='uploaded'),
        sa.Column('original_language', sa.String(length=10), nullable=False, server_default='en'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_reports_patient_id', 'reports', ['patient_id'])
    op.create_index('ix_reports_uploaded_by', 'reports', ['uploaded_by'])

    # 5. report_files
    op.create_table(
        'report_files',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('report_id', sa.String(length=36), nullable=False),
        sa.Column('storage_key', sa.String(length=255), nullable=False),
        sa.Column('mime', sa.String(length=50), nullable=False),
        sa.Column('page_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['report_id'], ['reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_report_files_report_id', 'report_files', ['report_id'])

    # 6. extracted_values
    op.create_table(
        'extracted_values',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('report_id', sa.String(length=36), nullable=False),
        sa.Column('test_name', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=50), nullable=False),
        sa.Column('ref_low', sa.Float(), nullable=True),
        sa.Column('ref_high', sa.Float(), nullable=True),
        sa.Column('flag', sa.String(length=20), nullable=False, server_default='normal'),
        sa.Column('page', sa.Integer(), nullable=False, server_default='1'),
        sa.ForeignKeyConstraint(['report_id'], ['reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_extracted_values_report_id', 'extracted_values', ['report_id'])
    op.create_index('ix_extracted_values_test_name', 'extracted_values', ['test_name'])

    # 7. explanations
    op.create_table(
        'explanations',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('report_id', sa.String(length=36), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('audio_key', sa.String(length=255), nullable=True),
        sa.Column('audio_available', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['report_id'], ['reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_explanations_report_id', 'explanations', ['report_id'])
    op.create_index('ix_explanations_language', 'explanations', ['language'])

    # 8. glossary_terms
    vector_type = Vector(384) if PG_VECTOR and bind.dialect.name == "postgresql" else sa.Text()
    op.create_table(
        'glossary_terms',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('term', sa.String(length=100), nullable=False),
        sa.Column('aliases', sa.JSON(), nullable=False),
        sa.Column('definition_simple', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('embedding', vector_type, nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_glossary_terms_term', 'glossary_terms', ['term'], unique=True)

    # 9. health_workers
    op.create_table(
        'health_workers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('region', sa.String(length=100), nullable=False),
        sa.Column('languages', sa.JSON(), nullable=False),
        sa.Column('is_available', sa.Boolean(), nullable=False, server_default='true'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_health_workers_user_id', 'health_workers', ['user_id'], unique=True)

    # 10. escalations
    op.create_table(
        'escalations',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('report_id', sa.String(length=36), nullable=False),
        sa.Column('patient_id', sa.String(length=36), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='open'),
        sa.Column('assigned_to', sa.String(length=36), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['assigned_to'], ['health_workers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['report_id'], ['reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_escalations_report_id', 'escalations', ['report_id'])
    op.create_index('ix_escalations_patient_id', 'escalations', ['patient_id'])

    # 11. call_logs
    op.create_table(
        'call_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('patient_id', sa.String(length=36), nullable=False),
        sa.Column('report_id', sa.String(length=36), nullable=False),
        sa.Column('channel', sa.String(length=10), nullable=False),
        sa.Column('provider_sid', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='initiated'),
        sa.Column('keypad_events', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['report_id'], ['reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_call_logs_patient_id', 'call_logs', ['patient_id'])
    op.create_index('ix_call_logs_report_id', 'call_logs', ['report_id'])

    # 12. consents
    op.create_table(
        'consents',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('purpose', sa.String(length=255), nullable=False),
        sa.Column('granted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_consents_user_id', 'consents', ['user_id'])

    # 13. audit_log
    op.create_table(
        'audit_log',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('actor_id', sa.String(length=36), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.String(length=36), nullable=True),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_audit_log_action', 'audit_log', ['action'])
    op.create_index('ix_audit_log_entity', 'audit_log', ['entity'])
    op.create_index('ix_audit_log_created_at', 'audit_log', ['created_at'])


def downgrade() -> None:
    op.drop_table('audit_log')
    op.drop_table('consents')
    op.drop_table('call_logs')
    op.drop_table('escalations')
    op.drop_table('health_workers')
    op.drop_table('glossary_terms')
    op.drop_table('explanations')
    op.drop_table('extracted_values')
    op.drop_table('report_files')
    op.drop_table('reports')
    op.drop_table('caregiver_links')
    op.drop_table('patients')
    op.drop_table('users')
