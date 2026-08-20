from typing import List, Dict, Any

class CatalogAuditorAgent:
    """
    Evaluates semantic alignment between registered merchant profile,
    product catalog, and live cart transactions.
    """

    @staticmethod
    def audit_catalog_consistency(
        registered_category: str,
        claimed_mcc: str,
        cart_items: List[Dict[str, Any]],
        historical_average_ticket: float
    ) -> Dict[str, Any]:
        discrepancies = []
        confidence_penalty = 0.0

        for item in cart_items:
            name = item.get("name", "").lower()
            price = float(item.get("price", 0))
            
            # Check price anomaly
            if historical_average_ticket > 0 and price > (historical_average_ticket * 10):
                discrepancies.append(f"Item '{item.get('name')}' priced at ₹{price:,.2f} is 10x above catalog average.")
                confidence_penalty += 30.0

            # Check category mismatch
            if "herbal" in registered_category.lower() or "soap" in registered_category.lower():
                if any(term in name for term in ["chip", "coin", "token", "bet", "vpn", "server", "license"]):
                    discrepancies.append(f"Item '{item.get('name')}' is non-physical/virtual, incompatible with '{registered_category}'.")
                    confidence_penalty += 50.0

        return {
            "is_consistent": len(discrepancies) == 0,
            "discrepancies": discrepancies,
            "confidence_penalty": min(confidence_penalty, 100.0)
        }

catalog_auditor = CatalogAuditorAgent()
