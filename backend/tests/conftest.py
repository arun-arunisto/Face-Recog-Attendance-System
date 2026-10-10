import pytest
from django.core.management import call_command

@pytest.fixture(autouse=True)
def seed_test_database(db):
    """
    Automatically seed test database for each test that accesses db.
    """
    call_command('seed_data')
