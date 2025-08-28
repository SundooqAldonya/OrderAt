import { StyleSheet } from 'react-native'
import { moderateScale } from '../../utils/scaling'

export const useStyles = theme => (StyleSheet.create({
    container: {
        height: moderateScale(40),
        flex: 1,
    },
    ovalContainer: {
        backgroundColor: theme?.gray200,
        flex: 1,
        borderRadius: moderateScale(40),
        marginHorizontal: moderateScale(10),
        marginVertical: moderateScale(5),
        flexDirection: 'row',
    },
    ovalButton: {
        flex: 1,
        borderRadius: moderateScale(40),
        marginHorizontal: moderateScale(2),
        marginVertical: moderateScale(2),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    instructionContainer: {
        padding: moderateScale(10),
        flexDirection: 'row',
        margin: moderateScale(10),
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: moderateScale(10),
        borderColor: theme.gray500
    },
    leftContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    middleContainer: { flex: 6, justifyContent: 'space-evenly' },
}))