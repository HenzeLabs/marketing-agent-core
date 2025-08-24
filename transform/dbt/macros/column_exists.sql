{% macro column_exists(relation, column_name) %}
  {# returns true/false at compile time #}
  {% set cols = adapter.get_columns_in_relation(relation) %}
  {% for c in cols %}
    {% if c.name | lower == column_name | lower %}
      {{ return(true) }}
    {% endif %}
  {% endfor %}
  {{ return(false) }}
{% endmacro %}
