import React, { useEffect, useState, useCallback } from 'react'
import Papa from 'papaparse'

import './App.css'
import Options from './components/Options'

import {
  TabGroup, TabList, Tab, TabPanels, TabPanel,
  Card, Legend, Metric, Text,
  Grid, Col,
  MultiSelect, MultiSelectItem, Button
} from "@tremor/react"

import { SortAscendingIcon, SortDescendingIcon, FolderIcon } from '@heroicons/react/solid'

const App = () => {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.style.setProperty('--bg-color', isDarkMode ? '#111827' : '#ffffff'); // change the colors as per your need

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const newColor = e.matches ? '#000' : '#fff'; // change the colors as per your need
    document.documentElement.style.setProperty('--bg-color', newColor);
  });
  

  const [currentTab, setCurrentTab] = useState(2022)
  const [gesData, setGesData] = useState<Array<any>>([])
  const [filteredGesData, setFilteredGesData] = useState<Array<any>>([])
  const [numYears, setNumYears] = useState(0)
  const [universitiesSelected, setUniversitiesSelected] = useState([
    "Nanyang Technological University",
    "National University of Singapore",
    "Singapore Institute of Technology",
    "Singapore Management University",
    "Singapore University of Social Sciences",
    "Singapore University of Technology and Design"
  ])
  const universityAcronyms = [
    {
      "Nanyang Technological University": "NTU"
    },
    {
      "National University of Singapore": "NUS"
    },
    {
      "Singapore Institute of Technology": "SIT"
    },
    {
      "Singapore Management University": "SMU"
    },
    {
      "Singapore University of Social Sciences": "SUSS"
    },
    {
      "Singapore University of Technology and Design": "SUTD"
    }
  ]

  const mapToAcronym = (full: string) => {
    for (let uni of universityAcronyms) {
      if (Object.keys(uni)[0] === full)
        return Object.values(uni)[0]
    }
  }

  const [checkboxState, setCheckboxState] = useState(false)

  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  const readCSV = (file: string) => {
    Papa.parse(file, {
      download: true,
      header: true,
      complete: (result) => {
        setGesData(result.data)
      }
    })
  }

  const handleTabChange = (index: number) => {
    setCurrentTab(gesData[gesData.length - 1].year - index)
  }

  const handleCheckboxChange = (newState: boolean) => {
    setCheckboxState(newState)
  }

  const onSort = (field: any) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedData = filteredGesData.sort((a, b) => {
    if (sortField && a[sortField] !== undefined && b[sortField] !== undefined) {
      if (!isNaN(a[sortField])) {
        let aValue = a[sortField] === 'na' ? 0 : a[sortField]
        let bValue = b[sortField] === 'na' ? 0 : b[sortField]
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      if (typeof a[sortField] === 'string') {
        let aValue = a[sortField] === 'na' ? '0' : a[sortField]
        let bValue = b[sortField] === 'na' ? '0' : b[sortField]
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
    }
    return 0
  })

  const filterGesData = useCallback((universities: Array<string>) => {
    setFilteredGesData(gesData.filter(row => universities.includes(row.university)))
  }, [gesData])

  const handleExport = (data: Array<any>) => {
    const csv = Papa.unparse(data)
    // console.log(csv)

    const blob = new Blob([csv], { type: 'text/csv' });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'GES_Table.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    const ges = '/ges.csv'
    readCSV(ges)
  }, [])

  useEffect(() => {
    if (checkboxState)
      setFilteredGesData(filteredGesData.filter(row => row.employment_rate_overall !== "na"))
    else
      filterGesData(universitiesSelected)
  }, [checkboxState, filterGesData, filteredGesData, universitiesSelected])


  useEffect(() => {
    if (gesData.length > 0) {
      setNumYears(parseInt(gesData[gesData.length - 1].year) - parseInt(gesData[0].year) + 1)
      setFilteredGesData(gesData)
    }
  }, [gesData])

  useEffect(() => {
    filterGesData(universitiesSelected)
  }, [universitiesSelected, filterGesData])

  const renderTabs = (numYears: number) => {
    return Array.from({ length: numYears }, (_, i) => (
      <Tab className='flex items-center justify-center text-center' key={i}>{parseInt(gesData[gesData.length - 1].year) - i}</Tab>
    ))
  }

  const renderTabPanels = (numYears: number) => {
    return Array.from({ length: numYears }, (_, i) => (
      <TabPanel key={i}>
        <div className="mt-10">
          <Col>
            <div className="flex justify-between items-center">
              <Legend
                className="mt-3"
                categories={["ER - Employment Rate", "Perm - Permanent", "BMS - Basic Monthly Salary", "GMS - Gross Monthly Salary", "Pct - Percentile"]}
                colors={["emerald", "emerald", "emerald", "emerald", "emerald"]}
              />
              <Button className='mr-8' onClick={() => handleExport(filteredGesData)} tooltip='The exported CSV will follow the exact order in which the table is currently formatted'>Export Table as CSV</Button>
            </div>
            <div className="flex flex-col h-screen mt-6">
              <div className="flex-grow overflow-auto">
                <table className="relative w-full">
                  <thead>
                    <tr>
                      <th className="sticky top-0 cursor-pointer select-none text-center"><Text>No.</Text></th>
                      <th className="sticky top-0 cursor-pointer select-none text-center" onClick={() => onSort('university')}><Text>University {(sortField === 'university' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</Text></th>
                      <th className="sticky top-0 cursor-pointer select-none" onClick={() => onSort('degree')}><Text>Degree {(sortField === 'degree' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</Text></th>
                      <th className="sticky top-0 cursor-pointer select-none text-center" onClick={() => onSort('employment_rate_overall')}><Text>Overall ER (%) {(sortField === 'employment_rate_overall' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</Text></th>
                      <th className="sticky top-0 cursor-pointer select-none text-center" onClick={() => onSort('employment_rate_ft_perm')}><Text>FT Perm. ER (%) {(sortField === 'employment_rate_ft_perm' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</Text></th>
                      <th className="sticky top-0 cursor-pointer select-none text-center" onClick={() => onSort('basic_monthly_mean')}><Text>BMS - Mean (S$) {(sortField === 'basic_monthly_mean' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</Text></th>
                      <th className="sticky top-0 cursor-pointer select-none text-center" onClick={() => onSort('basic_monthly_median')}><Text>BMS - Median (S$) {(sortField === 'basic_monthly_median' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</Text></th>
                      <th className="sticky top-0 cursor-pointer select-none text-center" onClick={() => onSort('gross_monthly_mean')}><Text>GMS - Mean (S$) {(sortField === 'gross_monthly_mean' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</Text></th>
                      <th className="sticky top-0 cursor-pointer select-none text-center" onClick={() => onSort('gross_monthly_median')}><Text>GMS - Median (S$) {(sortField === 'gross_monthly_median' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</Text></th>
                      <th className="sticky top-0 cursor-pointer select-none text-center" onClick={() => onSort('gross_mthly_25_percentile')}><Text>GMS - 25th Pct. (S$) {(sortField === 'gross_mthly_25_percentile' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</Text></th>
                      <th className="sticky top-0 cursor-pointer select-none text-center" onClick={() => onSort('gross_mthly_75_percentile')}><Text>GMS - 75th Pct. (S$) {(sortField === 'gross_mthly_75_percentile' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</Text></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      sortedData.filter(row => parseInt(row.year) === currentTab).map((row, j) => (
                        <tr key={j}  className="border-b border-gray-800">
                          <td className='text-center py-4'><Text>{j + 1}</Text></td>
                          <td className='text-center py-4'><Text>{mapToAcronym(row.university)}</Text></td>
                          <td className='py-4' style={{maxWidth: '300px'}}><Text>{row.degree}</Text></td>
                          <td className='text-center py-4'><Text>{row.employment_rate_overall}</Text></td>
                          <td className='text-center py-4'><Text>{row.employment_rate_ft_perm}</Text></td>
                          <td className='text-center py-4'><Text>{row.basic_monthly_mean}</Text></td>
                          <td className='text-center py-4'><Text>{row.basic_monthly_median}</Text></td>
                          <td className='text-center py-4'><Text>{row.gross_monthly_mean}</Text></td>
                          <td className='text-center py-4'><Text>{row.gross_monthly_median}</Text></td>
                          <td className='text-center py-4'><Text>{row.gross_mthly_25_percentile}</Text></td>
                          <td className='text-center py-4'><Text>{row.gross_mthly_75_percentile}</Text></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
            {/* 
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Year</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none">No.</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none" onClick={() => onSort('university')}>University {(sortField === 'university' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</TableHeaderCell>
                  <TableHeaderCell>School</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none" onClick={() => onSort('degree')}>Degree {(sortField === 'degree' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortAscendingIcon className="w-4 h-4 inline" />}</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none" onClick={() => onSort('employment_rate_overall')}>Overall ER (%) {(sortField === 'employment_rate_overall' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none" onClick={() => onSort('employment_rate_ft_perm')}>FT Perm. ER (%) {(sortField === 'employment_rate_ft_perm' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none" onClick={() => onSort('basic_monthly_mean')}>BMS - Mean (S$) {(sortField === 'basic_monthly_mean' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none" onClick={() => onSort('basic_monthly_median')}>BMS - Median (S$) {(sortField === 'basic_monthly_median' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none" onClick={() => onSort('gross_monthly_mean')}>GMS - Mean (S$) {(sortField === 'gross_monthly_mean' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none" onClick={() => onSort('gross_monthly_median')}>GMS - Median (S$) {(sortField === 'gross_monthly_median' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none" onClick={() => onSort('gross_mthly_25_percentile')}>GMS - 25th Pct. (S$) {(sortField === 'gross_mthly_25_percentile' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</TableHeaderCell>
                  <TableHeaderCell className="cursor-pointer select-none" onClick={() => onSort('gross_mthly_75_percentile')}>GMS - 75th Pct. (S$) {(sortField === 'gross_mthly_75_percentile' && sortDirection === 'desc') ? <SortAscendingIcon className="w-4 h-4 inline" /> : <SortDescendingIcon className="w-4 h-4 inline" />}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  sortedData.filter(row => parseInt(row.year) === currentTab).map((row, j) => (
                    <TableRow key={j}>
                      <TableCell className='text-center py-4'>{j + 1}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell className='text-center py-4'>{mapToAcronym(row.university)}</TableCell>
                      <TableCell>{row.school}</TableCell>
                      <TableCell className='overflow-auto whitespace-normal py-4' >{row.degree}</TableCell> 
                      <TableCell className='text-center py-4'>{row.employment_rate_overall}</TableCell>
                      <TableCell className='text-center py-4'>{row.employment_rate_ft_perm}</TableCell>
                      <TableCell className='text-center py-4'>{row.basic_monthly_mean}</TableCell>
                      <TableCell className='text-center py-4'>{row.basic_monthly_median}</TableCell>
                      <TableCell className='text-center py-4'>{row.gross_monthly_mean}</TableCell>
                      <TableCell className='text-center py-4'>{row.gross_monthly_median}</TableCell>
                      <TableCell className='text-center py-4'>{row.gross_mthly_25_percentile}</TableCell>
                      <TableCell className='text-center py-4'>{row.gross_mthly_75_percentile}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table> */}
          </Col>
        </div>
      </TabPanel>
    ))
  }

  return (
    <div className="App h-screen w-screen">
      <Grid numItems={1} className='h-screen w-screen'>
        <Col numColSpan={1}>
          <Card>
            <Metric>One Stop GES</Metric>

            <Text className='mt-4 w-1/2'>
              Contains information from <a className='text-blue-300' target="_blank" href="https://beta.data.gov.sg/datasets/415/view" rel='noopener noreferrer'>Graduate Employment Survey - NTU, NUS, SIT, SMU, SUSS & SUTD</a>, accessed on 2nd July 2023 from Ministry of Education (MOE), which is made available under the terms of the <a className='text-blue-300' target="_blank" href="https://beta.data.gov.sg/open-data-license" rel='noopener noreferrer'>Singapore Open Data Licence version 1.0</a>
            </Text>

            <TabGroup onIndexChange={handleTabChange}>
              <TabList className="mt-8 grid grid-cols-10 items-center">
                {renderTabs(numYears)}
              </TabList>

              <div className="flex items-center space-x-4 mt-4 -mb-10">
                <MultiSelect className='w-1/4' placeholder="Select Universities..." defaultValue={universitiesSelected} onValueChange={(universities) => {
                  setUniversitiesSelected(universities)
                }}>
                  <MultiSelectItem value="Nanyang Technological University">
                    Nanyang Technological University (NTU)
                  </MultiSelectItem>
                  <MultiSelectItem value="National University of Singapore">
                    National University of Singapore (NUS)
                  </MultiSelectItem>
                  <MultiSelectItem value="Singapore Institute of Technology">
                    Singapore Institute of Technology (SIT)
                  </MultiSelectItem>
                  <MultiSelectItem value="Singapore Management University">
                    Singapore Management University (SMU)
                  </MultiSelectItem>
                  <MultiSelectItem value="Singapore University of Social Sciences">
                    Singapore University of Social Sciences (SUSS)
                  </MultiSelectItem>
                  <MultiSelectItem value="Singapore University of Technology and Design">
                    Singapore University of Technology and Design (SUTD)
                  </MultiSelectItem>
                </MultiSelect>

                <Options onCheckboxChange={handleCheckboxChange}></Options>
              </div>

              <TabPanels>
                {renderTabPanels(numYears)}
              </TabPanels>
            </TabGroup>

            <div className="text-center align-center items-center mt-4">
              <a href="https://google.com" target="_blank" rel='noopener noreferrer'>
                <Button icon={FolderIcon} className='mr-8' variant='primary'>View the Repository</Button>
              </a>
            </div>
          </Card>
        </Col>
      </Grid>
    </div>
  )
}

export default App