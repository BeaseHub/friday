"""services, routes, schema revisited for all the tables

Revision ID: 23a9b734c847
Revises: 35a67dab85cd
Create Date: 2025-05-29 10:45:05.792794

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '23a9b734c847'
down_revision: Union[str, None] = '35a67dab85cd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
