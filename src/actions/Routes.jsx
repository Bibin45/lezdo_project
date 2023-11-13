import {BrowserRouter,Routes,Route} from 'react-router-dom';

import Home from '../container/Home';
import ReportContainer from '../container/ReportContainer';
import RecordContainer from '../container/RecordContainer';

function AdminRoutes() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' exact Component={Home}/>
      <Route path='/chart' Component={ReportContainer}/>
      <Route path='/records' Component={RecordContainer}/>
    </Routes>

    </BrowserRouter>
  );
}

export default AdminRoutes;
