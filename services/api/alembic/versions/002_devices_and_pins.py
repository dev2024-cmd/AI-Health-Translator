"""Add devices table and user profile columns

Revision ID: 002_devices_and_pins
Revises: 001_initial_schema
Create Date: 2026-09-28 13:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_devices_and_pins'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add user profile columns
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('age', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('usage', sa.String(length=20), server_default='self', nullable=False))

    # 2. Create devices table
    op.create_table(
        'devices',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('platform', sa.String(length=10), nullable=False),
        sa.Column('device_label', sa.String(length=100), nullable=False),
        sa.Column('pin_hash', sa.String(length=255), nullable=True),
        sa.Column('pin_set_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('failed_attempts', sa.Integer(), server_default='0', nullable=False),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('lockout_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('last_seen', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_devices_user_id', 'devices', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_devices_user_id', table_name='devices')
    op.drop_table('devices')
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('usage')
        batch_op.drop_column('age')
        batch_op.drop_column('name')
