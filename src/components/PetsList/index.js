import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { Creators as PetsActions } from '../../store/ducks/pets';
import { HelperService } from '../../services';
import Loader from '../Loader';
import Pagination from '../Pagination';
import PetItem from '../PetItem';
import { Container, Title, Fallback } from './styles';

function PetsList({
  userDonations, petsList, requesting, getPetsList, history, location,
}) {
  const pageSize = 6;
  const [loading, setLoading] = useState(true);
  const [petsListFiltered, setPetsListFiltered] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [excludeFoundPets, setExcludeFoundPets] = useState(false);
  const [regions, setRegions] = useState([]);
  const [orderBy, setOrderBy] = useState('lostDateDesc');

  useEffect(() => {
    getPetsList();
  }, [getPetsList]);

  useEffect(() => {
    const params = queryString.parse(location.search, { parseBooleans: true });
    setExcludeFoundPets(!params.excludeFoundPets);
    setRegions(params.regions ? params.regions : []);
    setOrderBy(params.orderBy ? params.orderBy : 'lostDateDesc');
  }, [location, setExcludeFoundPets, setRegions, setOrderBy]);

  useEffect(() => {
    if (totalPages > 0 && !loading) {
      const params = queryString.parse(location.search);
      const page = params.page ? parseInt(params.page, 10) : 1;

      if (!Number.isInteger(page) || page < 1 || page > totalPages) {
        delete params.page;

        history.push({
          ...location,
          search: queryString.stringify(params),
        });
      } else {
        setCurrentPage(page);
      }
    }
  }, [location, history, loading, totalPages, setCurrentPage]);

  useEffect(() => {
    if (!petsList.length) return;

    setLoading(true);

    let newPetsListFiltered = [...petsList];

    // Exclude found pets
    if (!excludeFoundPets) newPetsListFiltered = newPetsListFiltered.filter(pet => !pet.found);

    // Filter by region
    if (regions.length) {
      newPetsListFiltered = newPetsListFiltered.filter(pet => (
        regions.includes(pet.locality)));
    }

    // Order by name
    newPetsListFiltered.sort((a, b) => {
      switch (orderBy) {
        // Pet Name
        case 'petName':
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;

        // Lost Date Ascending
        case 'lostDateAsc':
          return new Date(a.lostDate) - new Date(b.lostDate);

        // Lost Date Descending
        default:
          return new Date(b.lostDate) - new Date(a.lostDate);
      }
    });

    const newTotalPages = Math.ceil(newPetsListFiltered.length / pageSize);
    if (totalPages !== newTotalPages) setTotalPages(newTotalPages > 0 ? newTotalPages : 1);

    setPetsListFiltered([...newPetsListFiltered]);
    setLoading(false);
  }, [petsList, excludeFoundPets, regions, orderBy, totalPages, setTotalPages, setLoading]);

  const renderPetsList = () => {
    if (!petsListFiltered.length) {
      return <Fallback>We haven&apos;t registered pets that match the filters!</Fallback>;
    }

    return HelperService.paginate(petsListFiltered, pageSize, currentPage).map((pet) => {
      const donation = userDonations.filter(tempDonation => tempDonation.petId === pet.id)[0];
      const amountDonated = donation ? donation.amountDonated : null;
      return <PetItem key={pet.id} pet={pet} amountDonated={amountDonated} />;
    });
  };

  return (
    <Container>
      <Title>Lost and Found Pets</Title>
      {(!requesting && !loading && currentPage > 0) ? renderPetsList() : <Loader loaderStyle="spin" />}
      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </Container>
  );
}

PetsList.propTypes = {
  userDonations: PropTypes.arrayOf(
    PropTypes.shape({
      amountDonated: PropTypes.string.isRequired,
      petId: PropTypes.string.isRequired,
    }),
  ).isRequired,
  petsList: PropTypes.arrayOf(
    PropTypes.shape({}),
  ).isRequired,
  requesting: PropTypes.bool.isRequired,
  getPetsList: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  userDonations: state.donations.userDonations,
  petsList: state.pets.petsList,
  requesting: state.pets.requesting,
});

const mapDispatchToProps = dispatch => bindActionCreators(PetsActions, dispatch);

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(PetsList);
