import { View, type ViewStyle } from "react-native"
import { Colors } from "@/constants/Colors"
import { ThemedText } from "../ThemedText"

type Props = {
    name: keyof (typeof Colors)["type"];
}

export function Pokemontype({name} : Props) {
    return <View style={[rootStyle, {backgroundColor: Colors.type[name]}]}>
        <ThemedText color="grayWhite" variant="subtitle3" style={{textTransform: "capitalize"}}>
            {name}
        </ThemedText>
    </View>
}

const rootStyle = {
    flex: 0,
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 8,
} satisfies ViewStyle