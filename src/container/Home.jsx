import React from 'react'
import { Link } from 'react-router-dom';
export default function Home() {
  return (
    <div className='paddi_t'> 
    <div className='center_card m-auto mt-5' style={{ textAlign: 'center'}}>
      <h1 className='py-5 grey_font'>Welcome</h1>
      <div style={{ margin: '20px' }}>
        <div>
        <Link to="/records" className='m-2'>
          <button className='btn btn-primary bold btn_width'>
            Task 1
          </button>
        </Link>
        </div>
        <div className='my-3'>
        <Link to="/chart" className='m-2'>
          <button className='btn btn-primary bold btn_width'>
            Task 2
          </button>
        </Link>
        </div>
        
      </div>
    </div>
    </div>
  )
}
