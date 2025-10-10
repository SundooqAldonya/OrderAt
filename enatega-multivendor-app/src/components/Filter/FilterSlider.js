import React, { useState, useContext, useEffect } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView
} from 'react-native'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import CheckboxBtn from '../../ui/FdCheckbox/CheckboxBtn'
import RadioButton from '../../ui/FdRadioBtn/RadioBtn'
import TextDefault from '../Text/TextDefault/TextDefault'
import styles from './styles'

import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { FILTER_TYPE } from '../../utils/enums'
import { useTranslation } from 'react-i18next'
import { Fragment } from 'react'
import { moderateScale } from '../../utils/scaling'
import { HighlightValues } from '../../screens/Menu/MenuV2'

const Filters = ({ filters, setFilters, applyFilters, showCategory }) => {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'

  const result =
    filters &&
    Object.keys(filters).filter((k) =>
      selectedFilter === 'all'
        ? filters[k]
        : selectedFilter === k
          ? filters[k]
          : null
    )

  const handleOptionsClick = () => {
    // setSelectedFilter('all')
    setModalVisible(true)
  }

  const handleFilterClick = (filter) => {
    setActiveFilter(filter)
    setModalVisible(true)
  }
  useEffect(() => {
  let found = false;
  for (const [key, value] of Object.entries(filters)) {
    if (!value?.selected || value?.selected?.length === 0) continue;
    // Special case for Highlights
    if (key === 'Highlights') {
      if (HighlightValues.includes(value.selected[0])) {
        setSelectedFilter(key);
        found = true;
        break;
      }
    }
    // For all other filters, any non-empty selection is valid
    else {
      setSelectedFilter(key);
      found = true;
      break;
    }
  }
}, [JSON.stringify(filters)]);
  const handleValueSelection = (filterTitle, filterValue) => {
    const selectedFilter = filters[filterTitle]
    if (selectedFilter.type === FILTER_TYPE.RADIO) {
      selectedFilter.selected = [filterValue]
    } else {
      const index = selectedFilter.selected.indexOf(filterValue)
      if (index > -1) {
        selectedFilter.selected = selectedFilter.selected.filter(
          (a) => a !== filterValue
        )
      } else selectedFilter.selected.push(filterValue)
    }
    setFilters({ ...filters, [filterTitle]: selectedFilter })
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        ...styles(currentTheme).container,
        flexDirection: isArabic ? 'row-reverse' : 'row'
      }}
    >
      {/* <TouchableOpacity
        style={styles(currentTheme).filterButton}
        onPress={handleOptionsClick}
      >
        <Ionicons
          name='options'
          size={moderateScale(22)}
          color={currentTheme.black}
        />
      </TouchableOpacity> */}

      {filters &&
        Object.keys(filters)?.map((filter, index) => (!filters[filter]?.values?.length) ? null : (
          <TouchableOpacity
            key={index}
            style={[
              styles(currentTheme).filterButton,
              (selectedFilter !== 'all' && (filter === 'Highlights' ? HighlightValues.includes(filters[filter]?.selected[0]) : filters[filter]?.selected?.length > 0))
                ? styles(currentTheme).selectedFilterButton
                : {}
            ]}
            onPress={() => handleFilterClick(filter)}
          >
            <SafeAreaView style={styles(currentTheme).itemContainer}>
              <TextDefault
                textColor={currentTheme.black}
                style={styles(currentTheme).filterButtonText}
              >
                {t(filter)}
              </TextDefault>
              <AntDesign
                name='down'
                size={moderateScale(14)}
                color={currentTheme.black}
              />
            </SafeAreaView>
          </TouchableOpacity>
        ))}

      <Modal visible={modalVisible} adjustToContentHeight animationType='slide'>
        <SafeAreaView style={{flex: 1}}>
        <View style={styles(currentTheme).modalHeader}>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <AntDesign
              name='arrowleft'
              size={moderateScale(24)}
              color={currentTheme.newIconColor}
            />
          </TouchableOpacity>
          <Text style={styles(currentTheme).filterText}> {t('filters')}</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <AntDesign
              name='closecircleo'
              size={moderateScale(24)}
              color={currentTheme.newIconColor}
            />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles(currentTheme).modalContainer}>
          {activeFilter && filters[activeFilter] && (
            <View key={activeFilter}>
              <Text style={styles(currentTheme).modalTitle} textColor={currentTheme.newFontcolor}>
                {t(activeFilter)}
              </Text>

              {filters[activeFilter]?.values?.map((value, index) => {
                const filter = filters[activeFilter]
                const isCategory = activeFilter === 'categories'
                const valueKey = isCategory ? value._id : value
                const label = isCategory ? value.name : value
                const isSelected = filter.selected.includes(valueKey)

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                      },
                      styles(currentTheme).modalItem,
                      isSelected && styles(currentTheme).selectedModalItem
                    ]}
                    onPress={() => handleValueSelection(activeFilter, valueKey)}
                  >
                    <TextDefault
                      style={styles(currentTheme).modalItemText}
                      textColor={currentTheme.newFontcolor}
                    >
                      {t(label)}
                    </TextDefault>

                    {filter.type === FILTER_TYPE.CHECKBOX ? (
                      <CheckboxBtn
                        checked={isSelected}
                        onPress={() =>
                          handleValueSelection(activeFilter, valueKey)
                        }
                      />
                    ) : (
                      <RadioButton
                        size={12}
                        innerColor={currentTheme.main}
                        outerColor={currentTheme.iconColorDark}
                        isSelected={isSelected}
                        onPress={() =>
                          handleValueSelection(activeFilter, valueKey)
                        }
                      />
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              setModalVisible(false)
              applyFilters && applyFilters()
            }}
            activeOpacity={0.5}
            style={styles(currentTheme).saveBtnContainer}
          >
            <TextDefault textColor={'black'} H4 bold>
              {t('apply')}
            </TextDefault>
          </TouchableOpacity>
        </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  )
}

export default Filters
