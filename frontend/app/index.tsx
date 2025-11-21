import { Employee, Manager } from "@/src/types/resources";
import { useState } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const [employee, setEmployee] = useState<Employee[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [manager, setManager] = useState<Manager[]>([]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>managment App</Text>
      {error ? (
        <Text>{`${error}`}</Text>
      ) : (
        employee.map((e) => (
          <Text key={e.id}>
            {e.firstName} {e.lastName}
          </Text>
        ))
      )}
    </View>
  );
}
