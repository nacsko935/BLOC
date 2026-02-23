import { useEffect, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../src/core/ui/Screen";
import Card from "../../src/core/ui/Card";
import { deleteTask, listTasks, toggleTask } from "../../src/features/tasks/tasksRepo";

export default function TaskDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const all = await listTasks(200);
      setTask(all.find((t) => t.id === String(id)) ?? null);
    })();
  }, [id]);

  if (!task) {
    return (
      <Screen>
        <Text style={{ color: "rgba(255,255,255,0.7)" }}>Chargement…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>{task.title}</Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 10 }}>
          Statut : {task.done ? "Terminé" : "À faire"}
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Pressable
            onPress={async () => {
              await toggleTask(task.id, !task.done);
              router.replace(`/task/${task.id}`);
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "white" }}
          >
            <Text style={{ fontWeight: "900" }}>{task.done ? "Remettre à faire" : "Marquer terminé"}</Text>
          </Pressable>

          <Pressable
            onPress={async () => {
              await deleteTask(task.id);
              router.replace("/(tabs)/home");
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#1b1b24" }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Supprimer</Text>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}
