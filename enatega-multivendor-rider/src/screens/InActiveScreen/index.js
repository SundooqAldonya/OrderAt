import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const InActiveScreen = () => {
	const { t } = useTranslation()
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Text>{t('inactive_screen_message')}</Text>
			<TouchableOpacity style={styles.btn}>
				<Text style={styles.btnText}>{t('titleLogout')}</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	btn: {
		backgroundColor: '#000',
		width: 300,
		height: 50,
		marginVertical: 20,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8
	},
	btnText: {
		color: '#fff',
	}
})

export default InActiveScreen