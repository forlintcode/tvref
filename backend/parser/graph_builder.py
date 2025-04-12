import networkx as nx
from collections import defaultdict

def build_dependency_graph(source_show, references):
    G = nx.DiGraph()
    reference_counts = defaultdict(int)

    # Add edges and track how often each target is referenced
    for ref in references:
        G.add_edge(source_show, ref)
        reference_counts[ref] += 1

    # Count the source show (if needed, usually 0)
    reference_counts[source_show] = reference_counts.get(source_show, 0)

    # Add counts and is_source flag as node attributes
    for node in G.nodes():
        G.nodes[node]["count"] = reference_counts.get(node, 0)
        G.nodes[node]["is_source"] = (node == source_show)

    return graph_to_dict(G)

def graph_to_dict(G):
    return {
        "nodes": [
            {
                "id": node,
                "count": G.nodes[node].get("count", 0),
                "is_source": G.nodes[node].get("is_source", False)
            }
            for node in G.nodes
        ],
        "links": [{"source": u, "target": v} for u, v in G.edges]
    }
