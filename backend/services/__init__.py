"""
Services package for OceanAI Email Agent
Contains MS Graph, Cohere, and Email Processing services
"""

from .ms_graph_service import MSGraphService
from .cohere_service import CohereService
from .email_processor import EmailProcessor

__all__ = ['MSGraphService', 'CohereService', 'EmailProcessor']