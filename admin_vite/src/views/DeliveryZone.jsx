/* eslint-disable react/display-name */
import React, { useState, useEffect } from "react";
import { useTranslation, withTranslation } from "react-i18next";
import {
  Container,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Typography,
  ListItemIcon,
} from "@mui/material";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react";
import Header from "../components/Headers/Header";
import CustomLoader from "../components/Loader/CustomLoader";
import {
  adjustDeliveryZoneTime,
  deleteZone,
  getAllDeliveryZones,
  getSingleDeliveryZoneTimeRange,
  removeDeliveryZone,
} from "../apollo";
import DataTable from "react-data-table-component";
import orderBy from "lodash/orderBy";
import SearchBar from "../components/TableHeader/SearchBar";
import { customStyles } from "../utils/tableCustomStyles";
import useGlobalStyles from "../utils/globalStyles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TableHeader from "../components/TableHeader";
import Alert from "../components/Alert";
import ConfigurableValues from "../config/constants";
import DeliveryZoneCreate from "../components/DeliveryZoneCreate";
import { gql } from "@apollo/client";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import TimeRangeModal from "../components/TimeRangeModal";

const GET_ZONES = gql`
  ${getAllDeliveryZones}
`;
const DELETE_ZONE = gql`
  ${removeDeliveryZone}
`;

const Zones = (props) => {
  const { t } = useTranslation();
  const { PAID_VERSION } = ConfigurableValues();
  const [editModal, setEditModal] = useState(false);
  const [zone, setZone] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [openTimeTableModal, setOpenTimeTableModal] = useState(false);
  const [range, setRange] = useState(null);
  const [from, setFrom] = useState("08:30");
  const [to, setTo] = useState("12:30");

  console.log({ range });

  const onChangeSearch = (e) => setSearchQuery(e.target.value);

  const [mutate, { error, loading }] = useMutation(DELETE_ZONE, {
    refetchQueries: [{ query: GET_ZONES }],
  });

  const [
    mutateDeliveryTime,
    { error: errorDeliveryTime, loading: loadingDeliveryTime },
  ] = useMutation(adjustDeliveryZoneTime, {
    refetchQueries: [{ query: GET_ZONES }],
    onCompleted: (res) => {
      console.log({ res });
    },
    onError: (err) => {
      console.log({ err });
    },
  });

  const [fetchTimeRange] = useLazyQuery(getSingleDeliveryZoneTimeRange);

  useEffect(() => {
    if (zone && openTimeTableModal) {
      fetchTimeRange({ variables: { id: zone._id } }).then(({ data }) => {
        console.log({ resTimeRange: data });
        setRange({
          from: data?.getSingleDeliveryZoneTimeRange.from,
          to: data?.getSingleDeliveryZoneTimeRange.to,
        });
        setFrom(data?.getSingleDeliveryZoneTimeRange.from);
        setTo(data?.getSingleDeliveryZoneTimeRange.to);
      });
    }
  }, [zone]);

  const { data, loading: loadingQuery, refetch } = useQuery(GET_ZONES);

  console.log({ zone });

  const toggleModal = (zone) => {
    setEditModal(!editModal);
    setZone(zone);
  };

  const closeEditModal = () => {
    setEditModal(false);
  };

  useEffect(() => {
    localStorage.removeItem("restaurant_id");
  }, []);

  const customSort = (rows, field, direction) => {
    const handleField = (row) => {
      if (row[field]) {
        return row[field].toLowerCase();
      }

      return row[field];
    };

    return orderBy(rows, handleField, direction);
  };

  const handleTimeTableOpen = (item) => {
    setZone(item);
    setOpenTimeTableModal(true);
  };

  const handleConfirm = ({ from, to }) => {
    setRange({ from, to });
    mutateDeliveryTime({
      variables: {
        id: zone._id,
        from,
        to,
      },
    });
  };

  const columns = [
    {
      name: t("Title"),
      sortable: true,
      selector: (row) => row.title,
    },
    {
      name: t("Description"),
      sortable: true,
      selector: (row) => row.description,
    },
    {
      name: t("Action"),
      cell: (row) => (
        <>
          {ActionButtons(
            row,
            PAID_VERSION,
            toggleModal,
            setIsOpen,
            t,
            mutate,
            handleTimeTableOpen
          )}
        </>
      ),
    },
  ];

  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), "g") : null;

  const filtered =
    searchQuery.length < 3
      ? data && data.getAllDeliveryZones
      : data &&
        data.getAllDeliveryZones.filter((zone) => {
          return (
            zone.title.toLowerCase().search(regex) > -1 ||
            zone.description.toLowerCase().search(regex) > -1
          );
        });

  const globalClasses = useGlobalStyles();

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        <DeliveryZoneCreate edit={false} />
        {/* Table */}
        {isOpen && (
          <Alert message={t("AvailableAfterPurchasing")} severity="warning" />
        )}
        {error ? <span>{`Error! ${error.message}`}</span> : null}
        {loading ? <CustomLoader /> : null}
        <DataTable
          subHeader={true}
          subHeaderComponent={
            <SearchBar
              value={searchQuery}
              onChange={onChangeSearch}
              onClick={() => refetch()}
            />
          }
          title={<TableHeader title={t("Zones")} />}
          columns={columns}
          data={filtered}
          pagination
          progressPending={loadingQuery}
          progressComponent={<CustomLoader />}
          sortFunction={customSort}
          defaultSortField="title"
          customStyles={customStyles}
          selectableRows
        />
        <Modal
          style={{
            width: "70%",
            marginLeft: "15%",
            overflowY: "auto",
          }}
          open={editModal}
          onClose={() => {
            toggleModal();
          }}
        >
          <DeliveryZoneCreate edit={true} zone={zone} />
        </Modal>

        <TimeRangeModal
          isOpen={openTimeTableModal}
          onClose={() => setOpenTimeTableModal(false)}
          onConfirm={handleConfirm}
          initialFrom={from}
          initialTo={to}
          minGapMinutes={15}
          allowAcrossMidnight={true}
        />
      </Container>
    </>
  );
};

const ActionButtons = (
  row,
  PAID_VERSION,
  toggleModal,
  setIsOpen,
  t,
  mutate,
  handleTimeTableOpen
) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <div>
        <IconButton
          aria-label="more"
          id="long-button"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Paper>
          <Menu
            id="long-menu"
            MenuListProps={{
              "aria-labelledby": "long-button",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem
              onClick={(e) => {
                e.preventDefault();
                handleTimeTableOpen(row);
              }}
              style={{ height: 25 }}
            >
              <ListItemIcon>
                <AccessAlarmIcon
                  fontSize="small"
                  style={{ color: "#4615b2" }}
                />
              </ListItemIcon>
              <Typography color="#4615b2">{t("time_table")}</Typography>
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.preventDefault();
                if (PAID_VERSION) toggleModal(row);
                else {
                  setIsOpen(true);
                  setTimeout(() => {
                    setIsOpen(false);
                  }, 5000);
                }
              }}
              style={{ height: 25 }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" style={{ color: "green" }} />
              </ListItemIcon>
              <Typography color="green">{t("Edit")}</Typography>
            </MenuItem>

            <MenuItem
              onClick={(e) => {
                e.preventDefault();
                if (PAID_VERSION) mutate({ variables: { id: row._id } });
                else {
                  setIsOpen(true);
                  setTimeout(() => {
                    setIsOpen(false);
                  }, 2000);
                }
              }}
              style={{ height: 25 }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" style={{ color: "red" }} />
              </ListItemIcon>
              <Typography color="red">{t("Delete")}</Typography>
            </MenuItem>
          </Menu>
        </Paper>
      </div>
    </>
  );
};

export default withTranslation()(Zones);
