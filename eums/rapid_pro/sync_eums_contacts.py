import logging

from eums.services.contact_service import ContactService

logger = logging.getLogger(__name__)


def execute_one_time_sync():
    contacts = ContactService.get_all()
    for contact in contacts:
        ContactService.add_or_update_rapid_pro_contact(contact)

execute_one_time_sync()
