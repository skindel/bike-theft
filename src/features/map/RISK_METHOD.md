# Neighbourhood shading (neighbourhood-v1)

## What the map shows

Each filled area is one official CBS _buurt_ (neighbourhood) for the municipality of Maastricht, taken from the CBS Wijk- en Buurtkaart 2024 through the PDOK WFS service. Water-only buurten are excluded. The geometry is used at its published resolution and is only rounded to five decimal places (roughly one metre) to reduce the payload. No boundary is invented, simplified into a different shape, or interpolated.

The fill colour encodes the _count per 100_ value held in the Supabase table `neighbourhood-data-2024`, joined to the boundary by neighbourhood name (case-, accent- and whitespace-insensitive). Nothing is computed from individual coordinates, so no false street-level precision is implied.

## Colour scale

The scale is linear from 0 to the highest rate present in the response, interpolated across five stops: teal, yellow, orange, salmon, crimson. The legend prints both ends of that range, so a colour can be read back to a number. The scale is relative to the current data: if the maximum changes, every colour changes with it.

A neighbourhood with no matching row, or a non-numeric value, is drawn in flat grey and labelled "No data" in the legend. Grey is not zero and zero is not safety.

## Limits that must be stated alongside the map

- This is a **recorded theft rate**, not a probability of theft and not a calibrated risk. It has no time horizon attached.
- Only the base of the rate is derived from the column name. What is being counted in the denominator still has to be confirmed and labelled precisely, because per 1,000 residents, per 1,000 bicycles and per 1,000 households are not interchangeable.
- Reporting rates and bicycle throughput differ sharply between a station area, a shopping centre and a residential street. A lighter neighbourhood may simply be under-reported or have fewer bikes present.
- All areas must cover the same period. The join does not check periods, so the table must hold one comparable period per row.
- Community self-reports are not merged into this layer. Official statistics and user submissions must stay distinguishable, and small counts need suppression before any opt-in reports contribute.

## Legacy demo bands

`risk.ts` still exposes the older synthetic `low / medium / high / unknown` bands (0–9, 10–24, 25+) used by the earlier fixture zones. They are not used by the neighbourhood layer and should be removed once nothing depends on them.
