import React, { Component } from 'react'
import RecordsAccordian from '../components/RecordsAccordian'

export default class RecordContainer extends Component {
   

  render() {
    return (<div className='bg-white h-100'>
<div className='dark_grey_bg'>
<div className='border_top'></div>
</div>
  
        <div className = 'p-2 '>
            <RecordsAccordian/>
        </div>
        </div>
    )
  }
}
