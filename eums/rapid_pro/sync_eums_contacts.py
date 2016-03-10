import logging

from eums.util.contact_client import ContactClient

logger = logging.getLogger(__name__)


def execute_one_time_sync():
    contacts = ContactClient.get_all()
    for contact in contacts:
        ContactClient.add_or_update_rapid_pro_contact(contact)

execute_one_time_sync()
