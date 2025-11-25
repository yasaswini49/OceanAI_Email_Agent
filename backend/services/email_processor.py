class EmailProcessor:
    def __init__(self, ms_graph_service, cohere_service):
        self.ms_graph = ms_graph_service
        self.cohere = cohere_service
    
    def fetch_and_process(self, count=20):
        """Fetch emails and process them with AI"""
        # Fetch emails
        emails = self.ms_graph.fetch_emails(count)
        
        # Process each email
        processed = []
        for email in emails:
            # Classify
            category = self.cohere.classify_email(email['body'])
            email['category'] = category
            
            # Extract action items (skip spam)
            if category not in ['Spam', 'Newsletters', 'Promotions']:
                action_items = self.cohere.extract_action_items(email['body'])
                email['actionItems'] = action_items
            else:
                email['actionItems'] = []
            
            processed.append(email)
        
        return processed
