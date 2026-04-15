import type { TransformedObservation } from "./transforms";
import { heatIndexC, windChillC, wetBulbC } from "./comfortMetrics";

export function enrichObservation(o: TransformedObservation): TransformedObservation {
  return {
    ...o,
    heatIndexC: heatIndexC(o.airTemperature, o.relativeHumidity),
    windChillC: windChillC(o.airTemperature, o.windAvg),
    wetBulbC: wetBulbC(o.airTemperature, o.relativeHumidity),
  };
}
