import { StyleSheet, Font } from '@react-pdf/renderer';

// Register standard fonts
// Note: In a real production app, you might want to use local font files
// for better reliability, but using CDNs for now as per existing pattern.
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
    fontWeight: 'medium',
});

Font.register({
    family: 'Roboto-Regular',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
    fontWeight: 'normal',
});

Font.register({
    family: 'Roboto-Bold',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
    fontWeight: 'bold',
});

// Font.register({
//     family: 'Roboto-Italic',
//     src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf',
//     fontStyle: 'italic',
// });

export const docStyles = StyleSheet.create({
    page: {
        padding: '2.5cm',
        fontFamily: 'Roboto-Regular',
        fontSize: 10,
        color: '#000',
        lineHeight: 1.4,
    },
    companyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    headerLeft: {
        width: '50%',
        textAlign: 'center',
    },
    headerRight: {
        width: '50%',
        textAlign: 'center',
    },
    companyName: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        textTransform: 'none',
    },
    brandName: {
        fontSize: 11,
        fontFamily: 'Roboto-Bold',
        textDecoration: 'underline',
    },
    nationalTitle: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        textTransform: 'none',
    },
    nationalMotto: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
    },
    underline: {
        marginTop: 2,
        height: 1,
        width: '40%',
        backgroundColor: '#000',
        alignSelf: 'center',
    },
    docMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
    },
    docNumber: {
        fontSize: 10,
    },
    docDate: {
        fontSize: 10,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Roboto-Bold',
        textAlign: 'center',
        marginVertical: 15,
        textTransform: 'none',
    },
    subtitle: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        marginTop: 10,
        marginBottom: 5,
    },
    text: {
        fontSize: 10,
        marginBottom: 4,
    },
    bold: {
        fontFamily: 'Roboto-Bold',
    },
    italic: {
        fontStyle: 'normal',
    },
    lawSection: {
        marginVertical: 10,
    },
    lawItem: {
        fontSize: 9,
        marginBottom: 2,
    },
    partySection: {
        marginTop: 10,
        marginBottom: 5,
    },
    partyTitle: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        marginBottom: 4,
    },
    partyInfo: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    partyLabel: {
        width: '25%',
    },
    partyValue: {
        flex: 1,
    },
    table: {
        width: '100%',
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 25,
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 25,
        alignItems: 'center',
    },
    tableCell: {
        padding: 4,
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    tableCellLast: {
        padding: 4,
        fontSize: 9,
    },
    colCenter: {
        textAlign: 'center',
    },
    colRight: {
        textAlign: 'right',
    },
    signatureSection: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        width: '45%',
        textAlign: 'center',
    },
    signatureSpace: {
        height: 60,
    },
    signatureName: {
        fontFamily: 'Roboto-Bold',
    }
});
