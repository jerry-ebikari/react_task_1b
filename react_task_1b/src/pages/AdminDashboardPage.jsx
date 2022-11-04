import React, { useState } from "react";
import { useEffect } from "react";
import MkdSDK from "../utils/MkdSDK";
import { AuthContext } from "../authContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import "../styles/AdminDashboardPage.css";


const monthMap = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec"
}

function formatDate(date) {
  let day = date.getDate();
  let month = monthMap[date.getMonth()];
  let year = date.getFullYear();
  return `${String(day).padStart(2, "0")} ${month} ${year}`;
}

function formatTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  return `${String(hours).padStart(2, 0)} : ${String(minutes).padStart(2, 0)}`;
}

let sdk = new MkdSDK();


const AdminDashboardPage = () => {
  let [currentTime, setCurrentTime] = useState(new Date());
  let [videos, setVideos] = useState([]);
  let [draggableList, setDraggableList] = useState([]);
  let [page, setPage] = useState(1);
  let [limit, setLimit] = useState(10);
  const { dispatch } = React.useContext(AuthContext);

  const logout = () => {
    dispatch({
      type: "LOGOUT",
    });
    window.location.href = `/admin/login`
  }

  const nextPage = () => {
    sdk.callRestAPI({
      page: page + 1,
      limit: limit
    }, "PAGINATE")
    .then((res) => {
      setPage((prev) => prev + 1);
      setVideos(() => res.list.sort((a, b) => {
        return Number(a.like) - Number(b.like)
      }));
    })
    
  }

  const previousPage = () => {
    sdk.callRestAPI({
      page: page - 1,
      limit: limit
    }, "PAGINATE")
    .then((res) => {
      setPage((prev) => prev - 1);
      setVideos(() => res.list.sort((a, b) => {
        return Number(a.like) - Number(b.like)
      }));
    })
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = [...draggableList];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setDraggableList(items);
  }

  useEffect(() => {
    setDraggableList([...videos]);
  }, [videos])

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    sdk.callRestAPI({
      page: page,
      limit: limit
    }, "PAGINATE")
    .then((res) => {
      setVideos(() => res.list.sort((a, b) => {
        return Number(a.like) - Number(b.like)
      }));
    })

    return (() => {clearInterval(t)});
  }, [])
  
  return (
    <>
      <header className="header">
        <h2 className="logo">APP</h2>
        <button className="logout-btn" onClick={logout}>
          <img src="/assets/icons/profile-icon.svg" alt="" />
          <span>Logout</span>
        </button>
      </header>
      <div className="title-section">
        <h1 className="title">Today's leaderboard</h1>
        <div className="date-section">
          <p className="date">{formatDate(currentTime)}</p>
          <button className="submission-status-btn">Submissions open</button>
          <p className="date">{formatTime(currentTime)}</p>
        </div>
      </div>

      <div className="table1">
        <div className="table-header-row">
          <p className="header-cell">#</p>
          <p className="header-cell">Title</p>
          <p className="header-cell">Author</p>
          <p className="header-cell last">Most Liked</p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="videos">
            {(provided) => (
              <div className="table-body" {...provided.droppableProps} ref={provided.innerRef}>
                {draggableList.map((video, index) => {
                  return (
                    <Draggable
                      key={String((page - 1) * 10 + (index + 1))}
                      draggableId={String((page - 1) * 10 + (index + 1))}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="row"
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <p className="v-align body-cell cell sno">{(page - 1) * 10 + (index + 1)}</p>
                          <div className="video-title-section v-align body-cell cell">
                            <img src={video.photo} alt="" />
                            <p>{video.title}</p>
                          </div>
                          <p className="author v-align cell">{video.username}</p>
                          <div className="video-like-section v-align body-cell cell">
                            <p className="video-like">{video.like}</p>
                            <img src="/assets/icons/up-arrow.svg" alt="" />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {
        <div className="next-prev-section">
          <button className="control-btn" onClick={previousPage} disabled={page == 1}>Previous</button>
          <button className="control-btn" onClick={nextPage}>Next</button>
        </div>
      }
    </>
  );
};

export default AdminDashboardPage;
