import React from 'react';
import {
  AssetRow,
  PropertyConfig,
  SectionConfig,
} from '@/lib/types/libraryAssets';
import styles from './LibraryAssetsTable.module.css';

export type LibraryAssetsTableProps = {
  library: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  sections: SectionConfig[];
  properties: PropertyConfig[];
  rows: AssetRow[];
};

export function LibraryAssetsTable({
  library,
  sections,
  properties,
  rows,
}: LibraryAssetsTableProps) {
  const hasSections = sections.length > 0;
  const hasProperties = properties.length > 0;
  const hasRows = rows.length > 0;

  if (!hasRows || !hasProperties) {
    let message: string;
    if (!hasProperties && !hasRows) {
      message =
        'No properties or assets configured yet. Please configure fields in Predefine and create at least one asset.';
    } else if (!hasProperties && hasRows) {
      message =
        'This Library has assets but no field definitions yet. Please add fields in Predefine.';
    } else {
      message =
        'This Library has field definitions but no assets yet. Please create assets to view the table.';
    }

    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          {message}
        </div>
      </div>
    );
  }

  const grouped = (() => {
    const byId = new Map<string, SectionConfig>();
    sections.forEach((s) => byId.set(s.id, s));

    const groupMap = new Map<
      string,
      {
        section: SectionConfig;
        properties: PropertyConfig[];
      }
    >();

    for (const prop of properties) {
      const section = byId.get(prop.sectionId);
      if (!section) continue;

      let group = groupMap.get(section.id);
      if (!group) {
        group = { section, properties: [] };
        groupMap.set(section.id, group);
      }
      group.properties.push(prop);
    }

    const groups = Array.from(groupMap.values()).sort(
      (a, b) => a.section.orderIndex - b.section.orderIndex
    );

    groups.forEach((g) => {
      g.properties.sort((a, b) => a.orderIndex - b.orderIndex);
    });

    const orderedProperties = groups.flatMap((g) => g.properties);

    return { groups, orderedProperties };
  })();

  const { groups, orderedProperties } = grouped;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRowTop}>
            {groups.map((group) => (
              <th
                key={group.section.id}
                scope="col"
                colSpan={group.properties.length}
                className={`${styles.headerCell} ${styles.sectionHeaderCell}`}
              >
                {group.section.name}
              </th>
            ))}
          </tr>
          <tr className={styles.headerRowBottom}>
            {groups.map((group) =>
              group.properties.map((property) => (
                <th
                  key={property.id}
                  scope="col"
                  className={styles.headerCell}
                >
                  {property.name}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody className={styles.body}>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={styles.row}
            >
              {orderedProperties.map((property) => {
                const value = row.propertyValues[property.key];
                const display =
                  value === null || value === undefined || value === ''
                    ? null
                    : String(value);

                return (
                  <td
                    key={property.id}
                    className={styles.cell}
                  >
                    {display ? (
                      display
                    ) : (
                      <span className={styles.placeholderValue}>—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LibraryAssetsTable;


