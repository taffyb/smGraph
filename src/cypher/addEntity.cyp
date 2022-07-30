//{"type":"","props":[{"key":,"value":}]}

CREATE (e:Entity)
SET e.uuid=apoc.create.uuid()
WITH e
CALL apoc.create.addLabels([e],[$type]) YIELD node
WITH e
UNWIND $props as p
WITH e,collect(p.key) as keys, collect(p.value) as values
CALL apoc.create.setProperties([e],keys,values) YIELD node
WITH e,properties(e) as props,filter(l IN labels(e) WHERE l <> 'Entity') as type
RETURN {type:type[0],uuid:e.uuid,props:props} as entity