import styles from "./FleetList.module.css";
import DroneCard, { DroneData } from "../DroneCard/DroneCard";

interface FleetListProps {
  drones: DroneData[];
}

export default function FleetList({ drones }: FleetListProps) {
  return (
    <div className={styles.contentAreaList}>
      <div className={styles.droneGrid}>
        {drones.map((drone) => (
          <DroneCard key={drone.droneId} drone={drone} />
        ))}
      </div>
    </div>
  );
}
